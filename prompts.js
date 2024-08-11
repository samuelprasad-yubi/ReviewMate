export const getPromptForCodeReview = (hello) => `
Please review the following code changes from a GitHub pull request. Analyze the changes and provide necessary suggestions.
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
snippet should be belongs to the file name which is in the path field.
you can add multiple comments for the same code snippet or file if there are multiple suggestions. add comments for multiple files also if there are any. and return all the comments in the json array.



Respond in the following JSON format. all fields of object are required and values should be there.
'code_snippets:[
    {
        "code_snippet": "<part of the code that needs correction, added or modified code only>",
        "comment": "<comment with necessary suggestion here for the code snippet, add multiple comments also if there are any>",
        "path": "<path of the code snippet for which comment needs to be added, return full path which is in the code github PR, The relative path to the file in the repository where the code_snippet is located. This should be the full path as specified in the GitHub pull request>",
 >",
        "sha": "<sha of the code snippet>",
         "diff_hunk": "<map whole patch(patch field data which is send to you for this file) here, which is shared to you>",
        "side": "<RIGHT for the new version of the code, LEFT for the original version, Indicates whether the comment is on the new version of the code (RIGHT) or the original version (LEFT). This helps to specify the context of the comment in relation to the changes made in the pull request>"

    }
]'`;
// "position": "<position of the code where comment has to be added for the code_snippet in the github pull request,The line index in the diff of the pull request where the comment should be placed. This helps in positioning the comment accurately within the diff >",

export const getPromptForCodeReview2 = (
    hello2
) => `I have a pull request with several modified files, and I need a detailed code review. Please provide review suggestions in an array of comments with code snippets and paths for each file. Include the following necessary practices in your review:

 Ensure the code adheres to best practices, is readable, and maintainable.
 Verify that the code changes are functionally correct.
If applicable, review the impact on the user interface.
 Check for any concurrency issues.
 Suggest ways to simplify complex logic.
 Comment on the necessity of the added features.
 Ensure there are appropriate unit tests for the changes.
 Verify that variable, function, and class names are meaningful and follow naming conventions.
 Ensure there are appropriate comments for complex code sections.
Review the following code changes : ${JSON.stringify(hello2)}
The analysis can be on a single line or a whole function; it may not always cover the entire file. In the code_snippet field, only the added or modified changes should be shown.
You can add multiple comments for the same code snippet or file if there are multiple suggestions. Add comments for multiple files also if there are any.

## Pull Request Review Comments template

### code review comments
code review comments with code snippet, code snippet should be github pr code snippet formate
comments should in sequence of code snippet and should be in list format
add position of the code snippet


`;

export const getPromptPrDescription = (
    hello3
) => `Analyze the provided code changes and generate a detailed GitHub pull request summary using the following template. Ensure the summary is concise and includes all necessary details related to the changes introduced. generate a pull request summary based on the template.
.
code changes in JSON.stringify: ${JSON.stringify(hello3)}
it contains array of objects, each object contains the details of the file changes in the pull request.
analyze the code changes and generate a pull request summary based on the template.
add review comments on each file changes in the JSON.stringify.
The analysis can be on a single line or a whole function; it may not always cover the entire file. In the code_snippet field, only the added or modified changes should be shown.
verify programming language syntax if it is correct or not or suggest changes in the comments.




## Pull Request Summary

### Title: [Short, Descriptive Title]

### Description:
Provide a concise overview of the changes introduced in this PR. Describe the problem it solves, the feature it adds, or any significant updates.


- Issue
- Issue 

### Changes Made (in Each file):
Briefly list the main changes made in this PR. Include key additions, deletions, or modifications.

- Change 1
- Change 2
- Change 3

### Implementation Details:

#### Code Quality:
Describe any improvements or refactoring done to enhance code quality.

#### Functionality:
Highlight any new functionality or changes in existing functionality.

#### UI Changes:
Mention any updates to the user interface, including screenshots if applicable.

#### Performance:
Note any performance improvements or considerations.

added as many comments as you can for the code changes in the JSON.stringify.
### code review comments with code snippet(add minium of 10 comments):
verify programming language syntax  of java if it is correct or not, if there any suggest changes in the comments.
Provide detailed code review comments based on the following criteria:
The analysis can be on a single line or a whole function; it may not always cover the entire file. In the code_snippet field, only the added or modified changes should be shown.
you can add multiple comments for the same code snippet or file if there are multiple suggestions. add comments for multiple files also if there are any. and return all the comments .
Mention any bugs found in the code and suggest fixes.Highlight any security concerns.


### Additional Notes:
Any other relevant information or considerations for the reviewer. Include any known issues, limitations, or areas needing further attention.

### Checklist:
- [ ] Code adheres to project coding standards
- [ ] Tests have been written and passed
- [ ] Documentation has been updated if necessary
- [ ] Relevant stakeholders have been notified

`;

export const getPromptPrTitle = (hello4) => `
Generate a concise and descriptive title for a GitHub pull request that includes the key changes made. The title should be short, informative, and to the point.
- **Feature/Issue:** [Brief description of the feature or issue]
code changes in JSON.stringify: ${JSON.stringify(hello4)}
Respond in the following JSON format:
  {
  "title": "<Short, Descriptive Title>",
  "Explanation": "<Explanation of the changes made in the PR>"
  }
`;
