/* eslint-disable no-console */
/* eslint-disable no-undef */
import dotenv from "dotenv";
import fs from "fs";
import http from "http";
import { Octokit, App } from "octokit";
import { createNodeMiddleware } from "@octokit/webhooks";
import { ReviewCommandHandler } from "./services/ReviewCommandHandler.js";
import GitHubService from "./services/GitHubService.js";
import ReviewService from "./services/ReviewService.js";
import StaticCodeAnalyzer from "./services/StaticCodeAnalyzerService.js";
import { getAnalyzeFilesForReview } from "./services/FileAnalyzer.js";
import { updatePrDescriptionWithSummary } from "./pullRequestUpdates.js";
dotenv.config();

const appId = process.env.APP_ID;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const secret = process.env.WEBHOOK_SECRET;
const enterpriseHostname = process.env.ENTERPRISE_HOSTNAME;

const app = new App({
    appId,
    privateKey,
    webhooks: {
        secret,
    },
    ...(enterpriseHostname && {
        Octokit: Octokit.defaults({
            baseUrl: `https://${enterpriseHostname}/api/v3`,
        }),
    }),
});

// const { data } = await app.octokit.request("/app");
// app.octokit.log.debug(`Authenticated as '${data.name}'`);

// Subscribe to the "pull_request.opened" webhook event
app.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
    console.log(
        `Received a pull request event for #${payload.pull_request.number}`
    );
    const githubService = new GitHubService({ octokit, payload });
    const review = new ReviewService(githubService, octokit);
    const staticCodeAnalyzer = new StaticCodeAnalyzer();

    try {
        const files = await githubService.listFiles();
        const filteredFiles = await getAnalyzeFilesForReview({
            files,
            githubService,
        });
        await staticCodeAnalyzer.analyzeFiles(filteredFiles);
        const prTemplate =
            await staticCodeAnalyzer.updatePRDescription(githubService);

        const filesContent = files
            .map(
                (file) => ` filename: ${file.filename}
            fileLink: ${file.blob_url}
            patch:${file.patch} \n`
            )
            .join("\n ---end of file--- \n")
            .concat("\n ---end of file ---\n");
        await updatePrDescriptionWithSummary(
            filesContent,
            githubService,
            prTemplate
        );

        await review.byAI({ filteredFiles });
        await review.submitReviewCommentsToPr();
    } catch (error) {
        console.error(error);
    }
});

app.webhooks.on(
    ["pull_request_review_comment.created", "pull_request.reopened"],
    async ({ octokit, payload }) => {
        // console.log("payload>>>", payload);
        if (payload.action === "reopened") {
            console.log("payload", payload);
            return;
        }
        const comment_author = payload.comment.user.login;
        const comment_body = payload.comment.body;
        const gitHubService = new GitHubService({ octokit, payload });

        if (comment_author === "reviewzen[bot]") {
            console.log("Comment made by the app. No reply needed.");
            return;
        }

        const commandMatch = comment_body.match(/^@reviewzen\s+(\w+)\s*(.*)$/i);

        const command = commandMatch?.[1].toLowerCase() || "";
        const promptText = commandMatch?.[2] || comment_body;

        const handler = new ReviewCommandHandler({
            payload,
            gitHubService,
        });
        await handler.handleCommand({ command, promptText });
    }
);

app.webhooks.onError((error) => {
    if (error.name === "AggregateError") {
        console.log(`Error processing request: ${error.event}`);
    } else {
        console.log(error);
    }
});

const port = process.env.PORT || 3000;
const path = "/api/webhook";
const localWebhookUrl = `http://localhost:${port}${path}`;

const middleware = createNodeMiddleware(app.webhooks, { path });

http.createServer(middleware).listen(port, async () => {
    console.log(`Server is listening for events at: ${localWebhookUrl}`);
    console.log("Press Ctrl + C to quit....,,");
});
