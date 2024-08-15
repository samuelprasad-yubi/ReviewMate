/* eslint-disable no-undef */
import { connectLLm } from "./network.js";
import { getSuggestionCommandPrompt } from "./prompts.js";

export class ReviewCommandHandler {
    constructor(octokit, payload) {
        this.octokit = octokit;
        this.owner = payload.repository.owner.login;
        this.repo = payload.repository.name;
        this.issue_number = payload.pull_request.number;
        this.file_path = payload.comment.path;
        this.head_commit_sha = payload.pull_request.head.sha;
        this.comment_body = payload.comment.body;
        this.comment_id = payload.comment.id;
        this.start_line = payload.comment.start_line || payload.comment.line;
        this.end_line = payload.comment.line;
        this.diffHunk = payload.comment.diff_hunk;
        this.gitHubService = new GitHubService(octokit, payload);
    }

    async handleCommand(command, promptText) {
        switch (command) {
            case "pause":
                await this.handlePauseCommand(promptText);
                break;
            case "suggestion":
                await this.handleSuggestionCommand(promptText);
                break;
            default:
                await this.unknownCommand(command);
        }
    }

    async handlePauseCommand(promptText) {
        const replyBody = `Review process paused for PR #${this.issue_number}. Reason: "${promptText}".`;
        await this.octokit.rest.issues.createComment({
            owner: this.owner,
            repo: this.repo,
            issue_number: this.issue_number,
            body: replyBody,
        });
    }

    async handleSuggestionCommand(promptText) {
        console.log("start line", {
            start_line: this.start_line,
            end_line: this.end_line,
        });
        try {
            const fileContent = await this.gitHubService.getContent();
            const fileLines = fileContent.split("\n");

            let affectedLinesArr = fileLines.slice(
                this.start_line - 1,
                this.end_line
            );

            const affectedLinesString = affectedLinesArr
                .map((line, index) => `${this.start_line + index}: ${line}`)
                .join("\n");

            //some files in pr contains empty line at the end
            if (fileLines[fileLines.length - 1] === "") {
                fileLines.pop();
            }

            const fileLinesString = fileLines
                .map((line, index) => `${index + 1}: ${line}`)
                .join("\n");

            console.log(affectedLinesString, fileLinesString);

            await connectLLm({
                prompt: getSuggestionCommandPrompt({
                    selectedLines: affectedLinesString,
                    fileContent: fileLinesString,
                    promptText,
                    start_line: this.start_line,
                    end_line: this.end_line,
                }),
            }).then((response) => {
                console.log("Response from the model:", response);
                this.createReplyForReviewComment(response.response);
            });

            return affectedLinesString;
        } catch (e) {
            console.log("Error", e);
        }
    }

    async unknownCommand(command) {
        const replyBody = `Unknown command: ${command}`;
        await this.octokit.issues.createComment({
            owner: this.owner,
            repo: this.repo,
            issue_number: this.issue_number,
            body: replyBody,
        });
    }

    async createReplyForReviewComment(replyBody) {
        try {
            await this.octokit.rest.pulls.createReplyForReviewComment({
                owner: this.owner,
                repo: this.repo,
                pull_number: this.issue_number,
                comment_id: this.comment_id,
                body: replyBody,
            });
            console.log(
                "Successfully replied to the comment:",
                this.comment_id
            );
        } catch (error) {
            console.error("Error replying to the comment:", error);
        }
    }
}
