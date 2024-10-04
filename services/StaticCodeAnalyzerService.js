/* eslint-disable no-console */
import path from "path";
import {
    getGithubDetailsTemplate,
    getGithubDetailsTemplateWithFile,
} from "../helper.js";
import { analyzeWithESLint } from "../staticCode/staticCodeAnalysis.js";

class StaticCodeAnalyzer {
    constructor({ githubService }) {
        this.staticCodeAnalysisResultsArray = [];
        this.executionMap = {
            ".js": this.analyzeHunkJavaScript,
            ".jsx": this.analyzeHunkJavaScript,
            ".ts": this.analyzeHunkJavaScript,
            ".tsx": this.analyzeHunkJavaScript,
        };
        this.githubService = githubService;
    }

    analyzeFiles = async (filteredFiles) => {
        for (const filteredFile of filteredFiles) {
            for (const patch of filteredFile.patches) {
                const ext = path.extname(filteredFile.file.filename);
                const executor = this.executionMap[ext];
                console.log("executor", executor, " >>>>>>>>> ", ext);
                if (executor) {
                    await executor({
                        hunk: filteredFile.fileContent,
                        hunkStartLine: patch.startLine,
                        hunkEndLine: patch.endLine,
                        filename: filteredFile.file.filename,
                    });
                } else {
                    console.log(`No executor found for file type: ${ext}`);
                }
            }
        }
    };

    analyzeFilesAPI = async (filteredFiles) => {
        for (const filteredFile of filteredFiles) {
            try {
                const ext = path.extname(filteredFile.file.filename);
                const json = await fetch("http://localhost:8000/analyze", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        language: ext,
                        code: filteredFile.fileContent,
                    }),
                });
                const data = await json.json();
                console.log("data", data.result?.[0]?.messages || []);
                const messages = data.result?.[0]?.messages || [];
                for (const message of messages) {
                    const lineLink = this.githubService.getLineLink({
                        filename: filteredFile.file.filename,
                        lineStart: message.line,
                    });
                    const template = getGithubDetailsTemplateWithFile({
                        message: `- ${message.message} (${message.ruleId})`,
                        filename: filteredFile.file.filename,
                        line: message.line,
                        lineLink: lineLink,
                    });
                    this.staticCodeAnalysisResultsArray.push(template);
                }
            } catch (e) {
                console.log("error", e);
            }
        }
    };

    analyzeHunkJavaScript = async ({
        hunk,
        hunkStartLine,
        hunkEndLine,
        filename,
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
                        const lineLink = this.githubService.getLineLink({
                            filename,
                            lineStart: message.line,
                        });
                        const template = getGithubDetailsTemplateWithFile({
                            message: `- ${message.message} (${message.ruleId})`,
                            filename: filename,
                            line: message.line,
                            lineLink: lineLink,
                        });
                        this.staticCodeAnalysisResultsArray.push(template);
                    }
                });
            });
        } catch (e) {
            console.log("error >> ", e);
        }
    };

    updatePRDescription = async (githubService) => {
        if (!this.staticCodeAnalysisResultsArray.length) {
            return "";
        }
        const content = this.staticCodeAnalysisResultsArray.join("\n");
        const template = getGithubDetailsTemplate({
            content: content,
            message: "static code analysis results",
        });

        await githubService.updatePrDescription(template);
        return template;
    };
}

export default StaticCodeAnalyzer;
