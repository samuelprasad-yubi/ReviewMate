/* eslint-disable no-console */
/* eslint-disable no-undef */
import dotenv from "dotenv";
import fs from "fs";
import http from "http";
import { Octokit, App } from "octokit";
import { createNodeMiddleware } from "@octokit/webhooks";
import { ReviewCommandHandler } from "./ReviewCommandHandler.js";
import GitHubService from "./services/GitHubService.js";
import ReviewService from "./services/ReviewService.js";
import StaticCodeAnalyzer from "./services/StaticCodeAnalyzerService.js";
import { analyzeFilesForReview } from "./services/FileAnalyzer.js";
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
    const githubService = new GitHubService(octokit, payload);
    const review = new ReviewService(githubService, octokit);
    const staticCodeAnalyzer = new StaticCodeAnalyzer();

    try {
        const files = await githubService.listFiles();
        const filteredFiles = await analyzeFilesForReview({
            files,
            githubService,
        });

        await staticCodeAnalyzer.analyzeFiles(filteredFiles);
        await staticCodeAnalyzer.updatePRDescription(githubService);

        await review.byAI(filteredFiles);
        await review.submitReviewCommentsToPr();
    } catch (error) {
        console.error(error);
    }
});

app.webhooks.on(
    "pull_request_review_comment.created",
    async ({ octokit, payload }) => {
        const comment_author = payload.comment.user.login;
        const comment_body = payload.comment.body;

        if (comment_author === "reviewzen[bot]") {
            console.log("Comment made by the app. No reply needed.");
            return;
        }

        const commandMatch = comment_body.match(/^@reviewzen\s+(\w+)\s*(.*)$/i);
        if (commandMatch) {
            const command = commandMatch[1].toLowerCase();
            const promptText = commandMatch[2];
            const handler = new ReviewCommandHandler(octokit, payload);
            await handler.handleCommand(command, promptText);
        }
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

    // await fetch("https://ml-ollama-qa.go-yubi.in/api/generate", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //         model: "llama3.1:latest",
    //         prompt: reviewFileDiff,
    //         stream: false,
    //         format: "json",
    //     }),
    // })
    //     .then((response) => response.json())
    //     .then(async (data) => {
    //         console.log(`Received a pull request event for`, data);
    //     })
    //     .catch((error) => console.error("Error:", error));
});

// console.log("Files in PR:", files);
// files.forEach((file) => {
//     console.log("fileeeeeee ", file);
// });

//PR description
// await fetch("https://ml-ollama-qa.go-yubi.in/api/generate", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//         model: "codellama:7b",
//         prompt: getPromptPrDescription(files),
//         stream: false,
//         options: {
//             seed: 42,
//             top_k: 50,
//             top_p: 0.95,
//             temperature: 0.1,
//             repeat_penalty: 1.2,
//         },
//     }),
// })
//     .then((response) => response.json())
//     .then(async (data) => {
//         console.log("parseGenResponse", data);
//         await octokit.rest.pulls.update({
//             owner,
//             repo,
//             pull_number,
//             body: data.response,
//         });
//     })
//     .catch((error) => console.error("Error:", error));

//PR title
// await fetch("https://ml-ollama-qa.go-yubi.in/api/generate", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//         model: "codellama:7b",
//         prompt: getPromptPrTitle(files),
//         stream: false,
//         options: {
//             seed: 42,
//             top_k: 50,
//             top_p: 0.95,
//             temperature: 0.1,
//             repeat_penalty: 1.2,
//         },
//     }),
// })
//     .then((response) => response.json())
//     .then(async (data) => {
//         console.log("parseGenResponse", data);
//         const parseGenResponse = JSON.parse(data.response);

//         await octokit.rest.pulls.update({
//             owner,
//             repo,
//             pull_number,
//             title: parseGenResponse.title,
//         });
//     })
//     .catch((error) => console.error("Error:", error));
