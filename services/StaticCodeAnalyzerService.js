/* eslint-disable no-console */
import path from "path";
import {
    getGithubDetailsTemplate,
    getGithubDetailsTemplateWithFile,
} from "../helper.js";
import { analyzeWithESLint } from "../staticCode/staticCodeAnalysis.js";

class StaticCodeAnalyzer {
    constructor() {
        this.staticCodeAnalysisResultsArray = [];
        this.executionMap = {
            ".js": this.analyzeHunkJavaScript,
            ".jsx": this.analyzeHunkJavaScript,
            ".ts": this.analyzeHunkJavaScript,
            ".tsx": this.analyzeHunkJavaScript,
        };
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
                        const template = getGithubDetailsTemplateWithFile({
                            message: `- ${message.message} (${message.ruleId})`,
                            filename: filename,
                            line: message.line,
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
