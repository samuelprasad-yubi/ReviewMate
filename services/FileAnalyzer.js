import { getHunksStr } from "../helper.js";
import { parsePatch, patchStartEndLine, splitPatch } from "../utils.js";

export const getAnalyzeFilesForReview = async ({ files, githubService }) => {
    const updatedFiles = await Promise.all(
        files.map(async (file) => {
            try {
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

                        return {
                            startLine: patchLines.newHunk.startLine,
                            endLine: patchLines.newHunk.endLine,
                            hunksStr: getHunksStr(hunks),
                        };
                    })
                    .filter((p) => !!p);

                if (patches.length <= 0) {
                    return null;
                }
                const fileContent = await githubService.getContent({
                    path: file.filename,
                });

                return { file, patches, fileDiff: file.patch, fileContent };
            } catch (e) {
                console.log("Error", e);
                return null;
            }
        })
    );
    return updatedFiles.filter((f) => !!f);
};

export const getCodeSnippetOfSelectedLines = async ({
    gitHubService,
    comment_file_path,
    start_line,
    end_line,
}) => {
    const fileContent = await gitHubService.getContent({
        path: comment_file_path,
    });
    const fileLines = fileContent.split("\n");

    const affectedLinesArr = fileLines.slice(start_line - 1, end_line);

    const selectedLinesWithLineNumbers = affectedLinesArr
        .map((line, index) => `${start_line + index}: ${line}`)
        .join("\n");

    //some files in pr contains empty line at the end
    if (fileLines[fileLines.length - 1] === "") {
        fileLines.pop();
    }

    const fileContentWithLineNumbers = fileLines
        .map((line, index) => `${index + 1}: ${line}`)
        .join("\n");

    return {
        fileContentWithLineNumbers,
        selectedLinesWithLineNumbers,
    };
};
