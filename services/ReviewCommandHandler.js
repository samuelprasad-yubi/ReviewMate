/* eslint-disable no-console */
/* eslint-disable no-undef */
import { connectLLm } from "../network.js";
import {
    getGenericPromptForComment,
    getSuggestionCommandPrompt,
} from "../prompts.js";
import { getCodeSnippetOfSelectedLines } from "./FileAnalyzer.js";

export class ReviewCommandHandler {
    constructor({ payload, gitHubService }) {
        this.gitHubService = gitHubService;
        this.owner = payload.repository.owner.login;
        this.repo = payload.repository.name;
        this.issue_number = payload.pull_request.number;
        this.comment_file_path = payload.comment.path;
        this.comment_body = payload.comment.body;
        this.start_line = payload.comment.start_line || payload.comment.line;
        this.end_line = payload.comment.line;
        this.diffHunk = payload.comment.diff_hunk;
        this.comment_id = payload.comment.id;
        this.user = payload.comment.user.login;
    }

    handleCommand = async ({ command, promptText }) => {
        await this.postComment({ command, promptText });
    };

    postComment = async ({ promptText, command }) => {
        try {
            const prompt = await this.getPromptBasedOnCommand({
                promptText,
                command,
            });

            // console.log("promptText>", prompt);
            const data = await connectLLm({
                prompt,
                options: { system: "" },
            });

            await this.gitHubService.createReplyForReviewComment({
                replyBody: data.response,
                comment_id: this.comment_id,
            });

            return data.response;
        } catch (e) {
            console.log("Error", e);
        }
    };

    getPromptBasedOnCommand = async ({ promptText, command }) => {
        try {
            const formattedThread =
                await this.gitHubService.getRoleFormatCommentsOfThreadStr();

            const code = await getCodeSnippetOfSelectedLines({
                gitHubService: this.gitHubService,
                comment_file_path: this.comment_file_path,
                start_line: this.start_line,
                end_line: this.end_line,
            });

            const content = {
                selectedLines: code.selectedLinesWithLineNumbers,
                fileContent: code.fileContentWithLineNumbers,
                promptText,
                start_line: this.start_line,
                end_line: this.end_line,
                user: this.user,
                diffHunk: this.diffHunk,
                formattedThread,
            };
            console.log("content", content);
            switch (command) {
                case "suggestion":
                    return getSuggestionCommandPrompt(content);

                default:
                    console.log("default >");
                    return getGenericPromptForComment(content);
            }
        } catch (e) {
            console.log("errror in getPromptBasedOnCommand", e);
            return "";
        }
    };

    unknownCommand = async (command) => {
        console.log(`Unknown command: ${command}`);
        return "";
    };
}
