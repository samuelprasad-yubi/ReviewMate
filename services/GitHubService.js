/* eslint-disable no-console */
import { filesAllowedForCodeReview } from "../constants.js";

class GitHubService {
    constructor(octokit, payload) {
        this.octokit = octokit;
        this.owner = payload.repository.owner.login;
        this.repo = payload.repository.name;
        this.pull_number = payload.pull_request.number;
        this.head_commit_sha = payload.pull_request.head.sha;
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
}

export default GitHubService;
