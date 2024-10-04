import path from "path";

export const getPrompthello = (hello) => `
Please review the following code changes from a GitHub pull request. Analyze the changes and provide necessary suggestions and Analyze the changes based on the following criteria.


1. Ensure the code is well-designed and follows best practices.
2. Verify that the code functionality is beneficial for the end-users.
3. Evaluate any UI changes to ensure they are sensible and visually appealing.
4. Check if any parallel programming is done safely.
5. Ensure the code is not more complex than necessary.
6. Confirm that the developer is not implementing features they might need in the future but don't need now.
7. Verify that the code has appropriate unit tests.
8. Ensure the tests are well-designed.
9. Check if clear and meaningful names are used for variables, functions, and classes.
10. Evaluate the comments to ensure they are clear, useful, and explain why instead of what.

code changes in json stringify:  ${JSON.stringify(hello)}
The analysis can be on a single line or a whole function; it may not always cover the entire file. In the code_snippet field, only the added or modified changes should be shown.


Respond in the following JSON format.
'json
[
    {
        "code_snippet": "<part of the code that needs correction, added or modified code only>",
        "comment": "<comment with necessary suggestion here for the code snippet>",
        "path": {
            "fileName": "<filename of the code snippet for which comment is added>"
        },
        "sha": "<sha of the code snippet>",
        position: "<line of the code where comment has to be added>
    }
]'`;

export const generateCommentData = (comment) => {
    const commentData = {
        path: comment.path,
        body: `${comment.comment}`,
        line: comment.endLine,
    };

    if (comment.startLine !== comment.endLine) {
        commentData.start_line = comment.startLine;
        commentData.start_side = "RIGHT";
    }
    return commentData;
};

export async function addReviewComment(
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

export const addPatchEndComment = (patch) => `${patch} 
                            ---end_change_section---`;

export const getHunksStr = (hunks) => `
---new_hunk---
\`\`\`
${hunks.newHunk}
\`\`\`

---old_hunk---
\`\`\`
${hunks.oldHunk}
\`\`\`
`;

export const getGithubDetailsTemplateWithFile = ({
    message,
    line,
    filename,
    lineLink,
}) => `

<details>
  <summary>${message}</summary> \n
   **File Name:** \`${filename}\`
   **Line Number:** [${line}](${lineLink})
</details>

`;

export const getGithubDetailsTemplate = ({ message, content }) => `

<details>
  <summary>${message}</summary>
  ${content}
</details>

`;

// export function generateTable(fileSummaries, githubService) {
//     // Initialize the table with headers
//     let table = `| Filename | File Summary | Count |\n|----------|---------------|----------|`;

//     // Loop through each file in the fileSummaries array
//     fileSummaries.forEach((fileSummaryItem) => {
//         // Destructure filename and summary from the file object
//         const { filteredFile, fileSummary } = fileSummaryItem;
//         const { filename, additions, deletions, blob_url } = filteredFile.file;
//         const basename = path.basename(filename);
//         // Format fileSummary as bullet points
//         const formattedSummary = fileSummary
//             .map((item) => `${item}`)
//             .join("<br>");
//         const fileLink = githubService.getLineLink({ filename });

//         table += `\n| [${basename}](${blob_url}) | ${formattedSummary} | [+${additions}/-${deletions}](${fileLink}) |`;
//     });

//     return table;
// }

export function generateTable(fileSummaries, githubService) {
    let table = `<table>
        <thead>
            <tr>
                <th>Filename</th>
                <th>File Summary</th>
                <th>Additions/Deletions</th>
            </tr>
        </thead>
        <tbody>`;

    fileSummaries.forEach((fileSummaryItem) => {
        const { filteredFile, fileSummary } = fileSummaryItem;
        const { filename, additions, deletions, blob_url } = filteredFile.file;
        const basename = path.basename(filename);

        const formattedSummary = fileSummary
            .map((item) => `${item}`)
            .join("<br>");
        const fileLink = githubService.getLineLink({ filename });

        table += `
            <tr>
                <td><a href="${blob_url}">${basename}</a></td>
                <td>${formattedSummary}</td>
                <td><a href="${fileLink}">+${additions}/-${deletions}</a></td>
            </tr>`;
    });

    table += `
        </tbody>
    </table>`;

    return table;
}
