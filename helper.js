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
