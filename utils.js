export const getDiffWithLineNumbers = (file) => {
    const patch = file.patch;
    const lines = patch.split("\n");

    let result = "";
    lines.forEach((line, index) => {
        if (line.startsWith("@@")) {
            const match = line.match(/@@ -\d+,\d+ \+(\d+),(\d+) @@/);
            if (match) {
                //const startLine = parseInt(match[1], 10);
                result += `${line}\n`;
            }
        } else {
            result += `Line ${index + 1}: ${line}\n   
            `;
        }
    });

    return result;
};

export const splitPatch = (patch = "") => {
    if (!patch) {
        return [];
    }

    const pattern = /(^@@ -(\d+),(\d+) \+(\d+),(\d+) @@).*$/gm;

    const result = [];
    let last = -1;
    let match;
    while ((match = pattern.exec(patch)) !== null) {
        if (last === -1) {
            last = match.index;
        } else {
            result.push(patch.substring(last, match.index));
            last = match.index;
        }
    }
    if (last !== -1) {
        result.push(patch.substring(last));
    }
    return result;
};

export const patchStartEndLine = (patch) => {
    const pattern = /(^@@ -(\d+),(\d+) \+(\d+),(\d+) @@)/gm;
    const match = pattern.exec(patch);
    if (match != null) {
        const oldBegin = parseInt(match[2]);
        const oldDiff = parseInt(match[3]);
        const newBegin = parseInt(match[4]);
        const newDiff = parseInt(match[5]);
        return {
            oldHunk: {
                startLine: oldBegin,
                endLine: oldBegin + oldDiff - 1,
            },
            newHunk: {
                startLine: newBegin,
                endLine: newBegin + newDiff - 1,
            },
        };
    } else {
        return null;
    }
};

export const parsePatch = (patch) => {
    const hunkInfo = patchStartEndLine(patch);
    if (hunkInfo == null) {
        return null;
    }

    const oldHunkLines = [];
    const newHunkLines = [];

    let newLine = hunkInfo.newHunk.startLine;

    const lines = patch.split("\n").slice(1); // Skip the @@ line

    // Remove the last line if it's empty
    if (lines[lines.length - 1] === "") {
        lines.pop();
    }

    // Skip annotations for the first 3 and last 3 lines
    const skipStart = 3;
    const skipEnd = 3;

    let currentLine = 0;

    const removalOnly = !lines.some((line) => line.startsWith("+"));

    for (const line of lines) {
        currentLine++;
        if (line.startsWith("-")) {
            oldHunkLines.push(`${line.substring(1)}`);
        } else if (line.startsWith("+")) {
            newHunkLines.push(`${newLine}: ${line.substring(1)}`);
            newLine++;
        } else {
            // context line
            oldHunkLines.push(`${line}`);
            if (
                removalOnly ||
                (currentLine > skipStart &&
                    currentLine <= lines.length - skipEnd)
            ) {
                newHunkLines.push(`${newLine}: ${line}`);
            } else {
                newHunkLines.push(`${line}`);
            }
            newLine++;
        }
    }

    return {
        oldHunk: oldHunkLines.join("\n"),
        newHunk: newHunkLines.join("\n"),
    };
};

export function parseReview(response, patches) {
    const reviews = [];
    if (
        !Array.isArray(response) ||
        response.length === 0 ||
        patches.length === 0
    ) {
        return reviews;
    }

    for (const review of response) {
        const { startLine, endLine, comment } = review;
        let withinPatch = false;
        let bestPatchStartLine = -1;
        let bestPatchEndLine = -1;
        let maxIntersection = 0;

        for (const {
            startLine: patchStartLine,
            endLine: patchEndLine,
        } of patches) {
            const intersectionStart = Math.max(startLine, patchStartLine);
            const intersectionEnd = Math.min(endLine, patchEndLine);
            const intersectionLength = Math.max(
                0,
                intersectionEnd - intersectionStart + 1
            );

            if (intersectionLength > maxIntersection) {
                maxIntersection = intersectionLength;
                bestPatchStartLine = patchStartLine;
                bestPatchEndLine = patchEndLine;
                withinPatch = intersectionLength === endLine - startLine + 1;
            }

            if (withinPatch) break;
        }

        let adjustedComment = comment;
        let adjustedStartLine = startLine;
        let adjustedEndLine = endLine;

        if (!withinPatch) {
            if (bestPatchStartLine !== -1 && bestPatchEndLine !== -1) {
                adjustedComment = `Note: This review was outside of the patch, Original lines [${startLine}-${endLine}]
  
  ${comment}`;
                adjustedStartLine = bestPatchStartLine;
                adjustedEndLine = bestPatchEndLine;
            } else {
                adjustedComment = `Note: This review was outside of the patch, Original lines [${startLine}-${endLine}]
  
  ${comment}`;
                adjustedStartLine = patches[0].startLine;
                adjustedEndLine = patches[0].startLine;
            }
        }

        reviews.push({
            startLine: adjustedStartLine,
            endLine: adjustedEndLine,
            comment: adjustedComment,
        });

        console.info(
            `Stored comment for line range ${adjustedStartLine}-${adjustedEndLine}: ${adjustedComment.trim()}`
        );
    }

    return reviews;
}
