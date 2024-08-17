{
    /* <s>: the beginning of the entire sequence.
<<SYS>>: the beginning of the system message.
<</SYS>>: the end of the system message.
[INST]: the beginning of some instructions.
[/INST]: the end of some instructions.
{{ system_prompt }}: Where the user should edit the system prompt to give overall context to model responses.
/{{ user_message }}: Where the user should provide instructions to the model for generating outputs. */
}

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

export const getPromptForCodeReview2 = (hello2, fileContent) => `
<s> [INST]

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
here im sharing the whole code of the file to understand about the patch code that belongs to the file.
file content: ${fileContent}.
understand the whole code of the file to provide the comments on the code changes.

The analysis can be on a single line or a whole function; it may not always cover the entire file. In the code_snippet field, only the added or modified changes should be shown.
You can add multiple comments for the same code snippet or file if there are multiple suggestions. Add comments for multiple files also if there are any.

## Pull Request Review Comments template

### code review comments
code review comments with code snippet, code snippet should be github pr code snippet formate
comments should in sequence of code snippet and should be in list format
add position of the code snippet


     ## Pull Request Review Comments template
         ### code review comments
         code review comments with code snippet, code snippet should be github pr code snippet formate
         comments should in sequence of code snippet and should be in list format.
         add explanation here why the code needs improvement, and also add code suggestions for the code snippet.
 
 [/INST]
`;

// ### explanation:
// - add explanation here why the code needs improvement.
// - short and clear explanation with basic english

// ### suggestion:
// - add suggestion here for the code changes along with code if necessary.
// - short and clear explanation with basic english , add code snippet if necessary.
// code_review_comments with code snippet, code snippet should be github pr code snippet formate.
// Respond in the following JSON format. all fields of object are required and values should be there.

// "code_snippets" :[
//     {
//        "code_review_comments": "<comments with necessary suggestion here for the code snippet, add multiple comments also if there are any>",
//         "start_line": "<starting line of the code snippet for which comments needs to be added>",
//         "end_line": "<ending line of the code snippet for which comments needs to be added>",
//     }
// ]

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

### Changes Made:
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

const suggestionSample = `
A suggestion is a code block in GitHub that allows reviewers to propose specific code changes directly in pull requests. The code inside a suggestion block can be applied by the author with a single click, making it easier to implement feedback.
For example, if you suggest a more efficient way to write a function, you can wrap your proposed change in a suggestion block, so the author can quickly adopt your recommendation.
I am working on a GitHub pull request and I need you to generate a code suggestion.
The suggestion should be formatted using the GitHub suggestion code block syntax. 
ensuring that the suggestion is wrapped inside the \`\`\`suggestion code block. Here's an example of how it should look:
example: 
Original code:
function addNumbers(a, b) {
    return a + b;
}
Suggested change:
\`\`\`suggestion
function addNumbers(a, b) {
    // Ensure the inputs are numbers
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Both arguments must be numbers');
    }
    return a + b;
}`;

export const reviewFileDiffFunPrompt = (file) => `

## IMPORTANT Instructions

**Input:** New hunks annotated with line numbers and old hunks (replaced code). Hunks represent incomplete code fragments.And File content after modification for the context of the code changes.

**Task:** Review the new hunks for substantive issues by utilizing the provided File Content and Example context. For any identified issues, provide comments and suggest fixes using \`diff\` code blocks, marking changes with \`+\` or \`-\` for code suggestions and also use code snippets.
check for missing edge cases in the code, suggest feedback why this it is a issue and you must provide in detailed explaination if issue is critical with code snippet, suggestion, diff code blocks


*** Guidance on Using File Content***
1. **Contextual Understanding:** Use the entire file content to understand the purpose and logic of the modified code. Consider how the functions, variables, and logic interact across the file to achieve the intended functionality. This will help you assess whether the new code changes are consistent with the overall design and intent of the file.
2. **Code Use Case:** Reflect on how the modified code works within the broader context of the file. Understanding the use case can help you identify issues such as logic errors, performance concerns, or deviations from best practices.
3. **Focus on Changes:** While the entire file content is provided to give you context, your review should focus solely on the new code changes presented in the new hunks. Do not review or comment on parts of the file that are outside the scope of these changes. Concentrate on identifying issues or improvements related specifically to the modifications.

For minor fixes, use \`suggestion\` code blocks. The line number range in the fix snippet must exactly match the range to be replaced in the new hunk.
Format: Use the GitHub suggestion code block syntax to wrap the proposed fix.
${suggestionSample}


**Output:** Your response should include review comments in JSON format, specifying the exact line number ranges in the new hunks where the comment applies. The start and end line numbers should fall within the same hunk. For single-line comments, use the same number for both start and end line.

If there are no issues found on a line range, you MUST respond with the 
text \`LGTM!\` for that line range in the review section. 


### Example

**Example Changes:**
[INST] must not comment on the example changes[/INST]

---file_content---
\`\`\`
# Full content of the file (after the modifications)
def divide(x, y):
    if y == 0:
        raise ValueError("Cannot divide by zero")
    return x / y

def add(x, y):
    z = x + y
    retrn z

def multiply(x, y):
    return x * y

def subtract(x, y):
    z = x - y
    return z
\`\`\`

---new_hunk---
\`\`\`
   if y == 0:
        raise ValueError("Cannot divide by zero")
    return x / y

6: def add(x, y):
7:     z = x + y
8:     retrn z
9: 
10: def multiply(x, y):
11:     return x * y

def subtract(x, y):
  z = x - y
\`\`\`
  
---old_hunk---
\`\`\`
    if y == 0:
        raise ValueError("Cannot divide by zero")
    return x / y

def add(x, y):
    return x + y

def subtract(x, y):
    z = x - y
\`\`\`

**Example Response:**

\`\`\`json
{
  "data": [
    {
      "startLine": 8,
      "endLine": 8,
      "comment": "There's a syntax error in the add function.\\n\\n\`suggestion\\nreturn z\\n\`"
    }
  ]
}
\`\`\`

## Review Template

- **File Content After Modifications:** (This is the entire content of the file after modifications were made)
  \`\`\`
  ${file.content}
  \`\`\`
  
- **Code Changes:** ${file.patch}

## Respond in JSON Format

Your response should strictly adhere to the following JSON structure:

\`\`\`typescript
interface Response {
  data: Array<{startLine: number; endLine: number; comment: string}>
}
\`\`\`
all the fields and its values are required.

[INST] <<SYS>> \n strictly review the code on the code changes only not on the file content or example code \n<</SYS>>\n 
User: give detailed code review in the comments fields 
you much include diff code block if you are suggestion a code fix  \`\`\`diff\`\`\` code blocks, marking changes with \`+\` or \`-\` for code suggestions. The line number range for comments with fix snippets must exactly match the range to replace in the new hunk.
you much include a emojis in the comments for example if the comment is about a bug, show 🐞,
show 💡 for insights etc.
Mention line numbers in each comment.
You must give positive feedback as well if you find best practices.
if you suggesting something you much include example code snippet on how to do it.
not only feedback on the bug you must always provide the solution.
you must mention criticality of the issue in the each comment if is a bug.
- critical (show in red color)
- high  (show in orange color)
- medium (show in yellow color)
- low  (show in green color)

 [/INST]

`;

// - **startLine**: The line number in the new hunk where the review comment should start.
// - **endLine**: The line number in the new hunk where the review comment should end.
// - **comment**: Your detailed review comment with any suggested code changes.

//Please provide a JSON response in the following format, with an array of objects containing the start and end lines along with a comment:

export const getSuggestionCommandPrompt = (file) => {
    return `I am working on a GitHub pull request and I need you to generate a code suggestion.
            Input: Code snippet with a issue that requires a fix. review the code changes and provide a suggestion to fix the issue.
            
            Task: Provide a suggestion to fix the issue using a suggestion code block.
            Output: Suggestion code block with the proposed fix.
            Format: Use the GitHub suggestion code block syntax to wrap the proposed fix.
            ${suggestionSample}

            ---start_of_context---
            ## context of the code changes, file content.
            ${file.fileContent}
            ---end of context---
            
           
              
            ---start_of_code_review---
           # review this code changes, strictly give code block suggestion on this changes only. 
           # return the whole code snippet along with suggested changes in the suggestion code block. don't add bug in the suggestion.
           # this code is part of the file content provided above. take that as a context and provide the suggestion.
           # these are the selected lines of the code snippet from above file content in the github PR for suggestion.
           # the suggested changes should be syntatically correct,  verify your code suggestion is correctly fits with the file content provided above if not correct it, sometimes you are adding "}" in code suggestion  even though its present in next line which i have not sent it.
           # don't add comments and line numbers inside the code suggestion.
           # add only the code that replaces the selected lines and don't add continuation of the code from the file content provided above.
           
           selected lines:
        
              ${file?.selectedLines || ""}

               ${
                   file.promptText
                       ? `## this is the  user prompt text, you must do what the user says: ${file.promptText}`
                       : ""
               }
            ---end_of_code_review---

    `;
};

// ---start_of_code_review---
// ## review this code changes, strictly give code block suggestion on this changes only.
// ## return the whole code snippet along with suggested changes in the suggestion code block. don't add bug in the suggestion.
// ## this code is part of the file content provided above. take that as a context and provide the suggestion.
// ## these are the selected lines of the code snippet from above file content in the github PR for suggestion.
// ## the suggested changes should be syntatically correct,  verify your code suggestion is correctly fits with the file content provided above if not correct it, sometimes you are adding "}" in code suggestion  even though its present in next line which i have not sent it.
// ## dont add comments and line numbers inside the code suggestion.
// ## add only the code that replaces the selected lines and dont add continuation of the code from the file content provided above.

// selected lines:

//    ${file?.selectedLines || ""}

//     ${
//         file.promptText
//             ? `## user prompt text, do what the user says: ${file.promptText}`
//             : ""
//     }
//  ---end_of_code_review---
