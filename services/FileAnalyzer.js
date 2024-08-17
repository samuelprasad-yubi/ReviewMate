import { getHunksStr } from "../helper.js";
import { parsePatch, patchStartEndLine, splitPatch } from "../utils.js";

export const analyzeFilesForReview = async ({ files, githubService }) => {
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
