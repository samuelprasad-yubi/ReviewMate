import dotenv from "dotenv";
import fs from "fs";
import http from "http";
import { Octokit, App } from "octokit";
import { createNodeMiddleware } from "@octokit/webhooks";
import {
    getPromptForCodeReview2,
    getPromptPrDescription,
    getPromptPrTitle,
} from "./prompts.js";
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

const { data } = await app.octokit.request("/app");

app.octokit.log.debug(`Authenticated as '${data.name}'`);

async function addReviewComment(
    octokit,
    owner,
    repo,
    pullNumber,
    commitId,
    path,
    position,
    codeSnippet,
    comment
) {
    console.log({
        owner,
        repo,
        pullNumber,
        commitId,
        path,
        position,
        codeSnippet,
        comment,
    });
    try {
        const response = await octokit.rest.pulls.createReviewComment({
            owner,
            repo,
            pull_number: pullNumber,
            commit_id: commitId,
            path,
            position: 1,
            body: comment,
        });
        console.log("Review comment added: ", response.data.html_url);
    } catch (error) {
        console.error("Error adding review comment: ", error);
    }
}

// Subscribe to the "pull_request.opened" webhook event
app.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
    console.log(
        `Received a pull request event for #${payload.pull_request.number}`
    );

    try {
        const owner = payload.repository.owner.login;
        const repo = payload.repository.name;
        const pull_number = payload.pull_request.number;

        const { data: files } = await octokit.rest.pulls.listFiles({
            owner,
            repo,
            pull_number,
        });

        //PR description
        await fetch("https://ml-ollama-qa.go-yubi.in/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "mistral",
                prompt: getPromptPrDescription(files),
                stream: false,
                options: {
                    seed: 42,
                    top_k: 50,
                    top_p: 0.95,
                    temperature: 0.1,
                    repeat_penalty: 1.2,
                },
            }),
        })
            .then((response) => response.json())
            .then(async (data) => {
                console.log("parseGenResponse", data);
                await octokit.rest.pulls.update({
                    owner,
                    repo,
                    pull_number,
                    body: data.response,
                });
            })
            .catch((error) => console.error("Error:", error));

        //PR title
        await fetch("https://ml-ollama-qa.go-yubi.in/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "mistral",
                prompt: getPromptPrTitle(files),
                stream: false,
                options: {
                    seed: 42,
                    top_k: 50,
                    top_p: 0.95,
                    temperature: 0.1,
                    repeat_penalty: 1.2,
                },
            }),
        })
            .then((response) => response.json())
            .then(async (data) => {
                console.log("parseGenResponse", data);
                const parseGenResponse = JSON.parse(data.response);

                await octokit.rest.pulls.update({
                    owner,
                    repo,
                    pull_number,
                    title: parseGenResponse.title,
                });
            })
            .catch((error) => console.error("Error:", error));
        console.log(`Received a pull request event for fetch, files`, files);

        //review comments for each file
        files.forEach(async (file) => {
            await fetch("https://ml-ollama-qa.go-yubi.in/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "mistral",
                    prompt: getPromptForCodeReview2(file),
                    stream: false,
                    options: {
                        seed: 42,
                        top_k: 50,
                        top_p: 0.95,
                        temperature: 0.1,
                        repeat_penalty: 1.2,
                    },
                }),
            })
                .then((response) => response.json())
                .then(async (data) => {
                    console.log(`Received a pull request event for`, data);

                    await addReviewComment(
                        octokit,
                        owner,
                        repo,
                        pull_number,
                        payload.pull_request.head.sha,
                        file.filename,
                        1,
                        "parseGenAiData.code_snippet",
                        data.response
                    );
                })
                .catch((error) => console.error("Error:", error));
        });

        console.log(`Received a pull request event for catch`);
    } catch (error) {
        if (error.response) {
            console.error(
                `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
            );
        } else {
            console.error(error);
        }
    }
});

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
    console.log("Press Ctrl + C to quit.");
});
