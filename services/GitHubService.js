/* eslint-disable no-console */
import { filesAllowedForCodeReview } from "../constants.js";

class GitHubService {
    constructor({ octokit, payload }) {
        this.octokit = octokit;
        this.owner = payload.repository.owner.login;
        this.repo = payload.repository.name;
        this.pull_number = payload.pull_request.number;
        this.head_commit_sha = payload.pull_request.head.sha;
        this.comment_id = payload?.comment?.comment_id;
        this.in_reply_to_id = payload?.comment?.in_reply_to_id;
    }

    getContent = async ({ path }) => {
        try {
            const { data: fileContentData } =
                await this.octokit.rest.repos.getContent({
                    owner: this.owner,
                    repo: this.repo,
                    path,
                    ref: this.head_commit_sha,
                });
            // eslint-disable-next-line no-undef
            const fileContent = Buffer.from(
                fileContentData.content,
                "base64"
            ).toString("utf-8");
            return fileContent;
        } catch (error) {
            console.log("Error getting file content: ", error);
            return "";
        }
    };

    createReplyForReviewComment = async ({ replyBody, comment_id }) => {
        try {
            await this.octokit.rest.pulls.createReplyForReviewComment({
                owner: this.owner,
                repo: this.repo,
                pull_number: this.pull_number,
                comment_id,
                body: replyBody,
            });
            console.log("Successfully replied to the comment:", comment_id);
        } catch (error) {
            console.error("Error replying to the comment:", error);
        }
    };

    listFiles = async () => {
        try {
            const { data: filesData } = await this.octokit.rest.pulls.listFiles(
                {
                    owner: this.owner,
                    repo: this.repo,
                    pull_number: this.pull_number,
                }
            );
            return filesData.filter(
                (file) =>
                    file.patch &&
                    file.filename &&
                    filesAllowedForCodeReview.test(file.filename)
            );
        } catch (error) {
            console.error("Error getting list of files: ", error);
            return [];
        }
    };

    updatePrDescription = async (description) => {
        try {
            await this.octokit.rest.pulls.update({
                owner: this.owner,
                repo: this.repo,
                pull_number: this.pull_number,
                body: description,
            });
            console.log("Successfully updated PR description");
        } catch (error) {
            console.error("Error updating PR description: ", error);
        }
    };

    getPrDescription = async () => {
        try {
            const response = await this.octokit.rest.pulls.get({
                owner: this.owner,
                repo: this.repo,
                pull_number: this.pull_number,
            });
            const description = response.data.body;
            console.log("PR Description received");
            return description;
        } catch (error) {
            console.error("Error fetching PR description: ", error);
            return null;
        }
    };

    createReviewComments = async (comments) => {
        try {
            const review = await this.octokit.rest.pulls.createReview({
                owner: this.owner,
                repo: this.repo,
                pull_number: this.pull_number,
                commit_id: this.head_commit_sha,
                comments,
            });
            console.log("Successfully added review comments");
            return review;
        } catch (error) {
            console.error("Error adding review comments: ", error);
        }
    };

    submitReview = async ({ reviewId, body }) => {
        try {
            await this.octokit.rest.pulls.submitReview({
                owner: this.owner,
                repo: this.repo,
                pull_number: this.pull_number,
                review_id: reviewId,
                event: "COMMENT",
                body,
            });
            console.log("Successfully submitted review");
        } catch (error) {
            console.error("Error submitting review: ", error);
        }
    };

    createReviewDescription = async ({ body }) => {
        try {
            await this.octokit.rest.pulls.createReview({
                owner: this.owner,
                repo: this.repo,
                pull_number: this.pull_number,
                commit_id: this.head_commit_sha,
                event: "COMMENT",
                body,
            });
            console.log("Successfully submitted review");
        } catch (error) {
            console.error("Error submitting review: ", error);
        }
    };

    listReviewComments = async () => {
        try {
            const { data: reviewComments } =
                await this.octokit.rest.pulls.listReviewComments({
                    owner: this.owner,
                    repo: this.repo,
                    pull_number: this.pull_number,
                });

            // console.log("reviewComments [0]", reviewComments[0]);
            console.log(
                "reviewComments",
                reviewComments.map(
                    (c) => ` ${c.id} --- ${c.in_reply_to_id} ---  ${c.body}`
                )
            );
            return reviewComments;
        } catch (error) {
            console.log("Error fetching comments of PR: ", error);
            return [];
        }
    };

    listReviewCommentsOfThread = async () => {
        try {
            const reviewComments = await this.listReviewComments();
            const threadComments = reviewComments.filter(
                (comment) => comment.in_reply_to_id === this.in_reply_to_id
            );
            const topLevelComment = reviewComments.filter(
                (comment) => comment.id === this.in_reply_to_id
            );
            return topLevelComment.concat(threadComments);
        } catch (error) {
            console.log("Error fetching comments of a Thread: ", error);
            return [];
        }
    };

    getRoleFormatCommentsOfThread = async () => {
        const threadComments = await this.listReviewCommentsOfThread();
        return threadComments.map((c) => ({
            role:
                c.user.type.toLowerCase() === "bot"
                    ? "{{assistant}}"
                    : `{{${c.user.login}}}`,
            content: c.body,
        }));
    };

    getRoleFormatCommentsOfThreadStr = async () => {
        const formattedThread = await this.getRoleFormatCommentsOfThread();
        const formattedThreadStr = formattedThread
            .map((c) => `${c.role}: ${c.content}`)
            .join("\n\n");

        return formattedThreadStr;
    };
}

export default GitHubService;
