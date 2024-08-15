/* eslint-disable no-undef */
import dotenv from "dotenv";
import fs from "fs";
import http from "http";
import { Octokit, App } from "octokit";
import { createNodeMiddleware } from "@octokit/webhooks";
import { reviewFileDiffFun } from "./prompts.js";
import {
    parsePatch,
    parseReview,
    patchStartEndLine,
    splitPatch,
} from "./utils.js";
import { ReviewCommandHandler } from "./ReviewCommandHandler.js";
import { connectLLm } from "./network.js";
import { analyzeWithESLint } from "./staticCode/staticCodeAnalysis.js";
import { generateCommentData } from "./helper.js";
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

function constructFileLineUrl({
    repoOwner,
    repoName,
    prNumber,
    filePath,
    startLine,
    endLine,
}) {
    const encodedFilePath = encodeURIComponent(filePath);
    return `https://github.com/${repoOwner}/${repoName}/pull/${prNumber}/files#diff-${encodedFilePath}L${startLine}-L${endLine}`;
}

app.octokit.log.debug(`Authenticated as '${data.name}'`);

// Subscribe to the "pull_request.opened" webhook event
app.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
    console.log(
        `Received a pull request event for #${payload.pull_request.number}`
    );

    try {
        const owner = payload.repository.owner.login;
        const repo = payload.repository.name;
        const pull_number = payload.pull_request.number;
        const commit_id = payload.pull_request.head.sha;

        const { data: files } = await octokit.rest.pulls.listFiles({
            owner,
            repo,
            pull_number,
        });

        constructFileLineUrl({
            repoName: repo,
            repoOwner: owner,
            prNumber: pull_number,
            filePath: files[0].filename,
            startLine: 1,
            endLine: 10,
        });

        files.forEach((file) => {
            if (!file.patch || !file.filename) {
                return null;
            }
        });

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

        const staticCodeAnalysisResultsArray = [];
        const staticCodeAnalysisResults = async ({
            hunk,
            hunkStartLine,
            hunkEndLine,
        }) => {
            try {
                const results = await analyzeWithESLint(hunk);

                results.forEach((result) => {
                    result.messages.forEach((message) => {
                        console.log(
                            `>>>> line: ${message.line} - hunkStartLine: ${hunkStartLine} ${hunkEndLine}   | :${message.column} ${message.message} (${message.ruleId})`
                        );

                        if (
                            message.line >= hunkStartLine &&
                            message.line <= hunkEndLine
                        ) {
                            staticCodeAnalysisResultsArray.push(
                                `if ${message.line}, ${message.endLine} :${message.column} ${message.message} (${message.ruleId})`
                            );
                        }
                    });
                });
                // console.log("Analysis Results:", results);
            } catch (e) {
                console.log("error >> ", e);
            }
        };

        const filteredFiles = files
            .map((file) => {
                if (!file.patch || !file.filename) {
                    return null;
                }
                const patches = splitPatch(file.patch)
                    .map((patch) => {
                        // console.log(`Patch: ${patch}`);
                        const patchLines = patchStartEndLine(patch);
                        if (patchLines == null) {
                            return null;
                        }

                        const hunks = parsePatch(patch);
                        if (hunks == null) {
                            return null;
                        }

                        const hunksStr = `
                        ---new_hunk---
                        \`\`\`
                        ${hunks.newHunk}
                        \`\`\`
                        
                        ---old_hunk---
                        \`\`\`
                        ${hunks.oldHunk}
                        \`\`\`
                        `;

                        return {
                            startLine: patchLines.newHunk.startLine,
                            endLine: patchLines.newHunk.endLine,
                            hunksStr,
                        };
                    })
                    .filter((p) => !!p);

                if (patches.length <= 0) {
                    return null;
                }
                return { file, patches, fileDiff: file.patch };
            })
            .filter((f) => !!f);

        for (const filteredFile of filteredFiles) {
            try {
                const { data: fileContentData } =
                    await octokit.rest.repos.getContent({
                        owner,
                        repo,
                        path: filteredFile.file.filename,
                        ref: commit_id,
                    });
                const fileContent = Buffer.from(
                    fileContentData.content,
                    "base64"
                ).toString("utf-8");

                for (const patch of filteredFile.patches) {
                    // console.log("patch staticCodeAnalysisResults", patch);
                    await staticCodeAnalysisResults({
                        hunk: fileContent,
                        hunkStartLine: patch.startLine,
                        hunkEndLine: patch.endLine,
                    });
                }
            } catch (e) {
                console.log("Error", e);
            }
        }

        console.log(
            "staticCodeAnalysisResultsArray",
            staticCodeAnalysisResultsArray
        );

        try {
            await octokit.rest.pulls.update({
                owner,
                repo,
                pull_number,
                body: staticCodeAnalysisResultsArray.join("\n"),
            });
        } catch (e) {
            console.log("Error", e);
        }

        const reviewCommentsBuffer = [];
        for (const filteredFile of filteredFiles) {
            let patchText = "";
            filteredFile.patches.forEach(async (patch) => {
                patchText += `${patch.hunksStr} 
                    ---end_change_section---`;
            });

            const prompt = reviewFileDiffFun({
                fileName: filteredFile.file.filename,
                patch: patchText,
            });

            await connectLLm({ prompt, options: { format: "json" } })
                .then(async (data) => {
                    console.log(`Received response from LLM`, data);
                    const parseGenResponse = JSON.parse(data.response);
                    if (
                        parseGenResponse?.data &&
                        Array.isArray(parseGenResponse?.data)
                    ) {
                        const filteredParseGenResponse =
                            parseGenResponse.data.filter((item) => {
                                if (
                                    item?.startLine &&
                                    item?.endLine &&
                                    item?.comment
                                ) {
                                    return true;
                                }
                                return false;
                            });

                        // console.log({ filteredParseGenResponse });
                        const parsedReviewComments = parseReview(
                            filteredParseGenResponse,
                            filteredFile.patches
                        );
                        console.log({ parsedReviewComments });

                        parsedReviewComments
                            .filter((p) => !!p.endLine && !!p.startLine)
                            .forEach((review) => {
                                reviewCommentsBuffer.push({
                                    path: filteredFile.file.filename,
                                    ...review,
                                });
                            });
                    }
                    // console.log("loop", { reviewCommentsBuffer });
                })
                .catch((error) => console.error("Error:", error));
        }
        // console.log("out loop", { reviewCommentsBuffer });
        if (reviewCommentsBuffer.length === 0) {
            // Submit empty review
            try {
                await octokit.rest.pulls.createReview({
                    owner,
                    repo,
                    pull_number,
                    commit_id,
                    event: "COMMENT",
                    body: "No review comments generated.",
                });
            } catch (e) {
                console.warn(`Failed to submit empty review: ${e}`);
            }
            return;
        }

        try {
            const comments = reviewCommentsBuffer.map(generateCommentData);
            // console.log({ comments });
            const review = await octokit.rest.pulls.createReview({
                owner,
                repo,
                pull_number,
                commit_id,
                comments,
            });
            // console.log({ review });
            await octokit.rest.pulls.submitReview({
                owner,
                repo,
                pull_number,
                review_id: review.data.id,
                event: "COMMENT",
                body: "Review comments added",
            });

            // console.log("Review comment added: ", review.data.html_url);
        } catch (e) {
            console.log("Error adding review comment: ", e);
        }
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
    console.log("Press Ctrl + C to quit.");

    // Example usage
    //     const code = `
    // function longFunctionName(paramOne, paramTwo, paramThree, paramFour, paramFive) {
    //     let someVariable;
    //     if (paramOne > paramTwo {
    //         console.log('Debug:', paramOne);
    //         someVariable = paramOne + paramTwo;
    //     }
    //     return someVariable;
    // }

    // var oldStyleVariable = 10;

    // const add = x => x + 10;
    // //hey
    // function shortName() {
    //     return 1;
    // }
    // `;
    try {
        // const results = analyzeCode(code);
        // console.log("Analysis Results:", results);
    } catch (e) {
        console.log("error >> ", e);
    }

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
