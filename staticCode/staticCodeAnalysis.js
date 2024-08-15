// import * as acorn from "acorn";
// const { parse } = require("@typescript-eslint/typescript-estree");
// import { parse } from "@typescript-eslint/typescript-estree";
import parse from "@typescript-eslint/parser";

// const code = `const hello: string = 'world';`;
// const ast = parse(code, {
//     loc: true,
//     range: true,
// });

function tsParseFun(content) {
    const context = {
        languageOptions: {
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
            },
        },
    };
    const contextParserOptions = context.languageOptions?.parserOptions ?? {};
    const parserOptions =
        parse.withoutProjectParserOptions(contextParserOptions);

    const result = parse.parseForESLint(content, parserOptions);
    console.log(result);
}

// tsParseFun("const hello: string = 'world';");

// const { parseForESLint } = require("@typescript-eslint/parser");

function analyzeCodee(code) {
    const parserOptions = {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true, // If you're working with React
        },
    };

    // Parse the code into an AST
    const parseResult = parse.parseForESLint(code, parserOptions);
    const { ast } = parseResult;

    // Perform static analysis on the AST
    traverseAST(ast);
}

function traverseAST(ast) {
    // Example traversal - simple recursive function to log nodes
    function traverse(node, depth = 0) {
        console.log(" ".repeat(depth * 2) + node.type);

        for (const key in node) {
            if (node[key] && typeof node[key] === "object" && node[key].type) {
                traverse(node[key], depth + 1);
            }
        }
    }

    traverse(ast);
}

// Example TypeScript code to analyze
const code = `
import CAAlert from '@yubi/yb-core-alert';

const AlertView = () => {
  const {  } = useStyles;
  return (
    <CAAlert
      size={'large'}
      type={'error'}
      styleConnector={styleConnector}
      alertMessage={'Alert Message '}
      alertTitle={'Alert Title '}
      showCloseIcon={true}
      actionType={'button'}
      actionName={'PlaceHolder'}
      actionOnClick={() => {}}
      closeOnClick={}
    />
  );
};

export default AlertView;
`;

// analyzeCodee(code);

// const { ESLint } = require("eslint");
import { ESLint } from "eslint";
// const tsRecommended = require("@typescript-eslint/eslint-plugin").configs
//     .recommended; // TS recommended rules
import tsConfigs from "@typescript-eslint/eslint-plugin";

export async function analyzeWithESLint(code) {
    const eslint = new ESLint();

    const results = await eslint.lintText(code, { filePath: "example.tsx" });
    console.log("results", results);
    // Output the linting results
    // results.forEach((result) => {
    //     return result.messages.forEach((message) => {
    //         console.log(
    //             `>>>> ${message.line}:${message.column} ${message.message} (${message.ruleId})`
    //         );
    //     });
    // });

    return results;
}
const codee = `

import React from 'react';
const MyComponent = () => {
  return <UndefinedComponent />;
};
export default MyComponent;

`;

// analyzeWithESLint(codee);

export function analyzeCode(code) {
    try {
        const tree = parse(code, {
            ecmaVersion: 2020,
            locations: true,
            loc: true,
            range: true,
            comment: true,
            jsx: true,
            jsDocParsingMode: "none",
            allowInvalidAST: true,
            debugLevel: true,
        });
        const analysisResult = [];
        walkNode(tree, 0, analysisResult);
        return analysisResult;
    } catch (error) {
        return [
            {
                message: `Syntax Error: ${error.message}`,
                startLine: error?.location ? error.location.start : 1,
                startColumn: error.location ? error.location.end : 1,
            },
        ];
    }
}

function walkNode(node, depth = 0, analysisResult) {
    switch (node.type) {
        // Condition 1: Check for functions with names longer than 10 characters
        case "FunctionDeclaration":
            if (node.id.name.length > 10) {
                analysisResult.push({
                    message: `Function '${node.id.name}' has a name longer than 10 characters.`,
                    startLine: node.loc.start.line,
                    endLine: node.loc.end.line,
                });
            }
            if (node.params.length > 4) {
                // Condition 3: Functions with too many parameters
                analysisResult.push({
                    message: `Function '${node.id.name}' has more than 4 parameters.`,
                    startLine: node.loc.start.line,
                    endLine: node.loc.end.line,
                });
            }
            break;

        // Condition 2: Detect variable names that are not in camelCase
        case "VariableDeclaration":
            node.declarations.forEach((declaration) => {
                if (
                    declaration.id.name !==
                    declaration.id.name[0].toLowerCase() +
                        declaration.id.name.slice(1)
                ) {
                    analysisResult.push({
                        message: `Variable '${declaration.id.name}' should be in camelCase.`,
                        startLine: node.loc.start.line,
                        endLine: node.loc.end.line,
                    });
                }
                if (node.kind === "var") {
                    // Condition 6: Detect usage of `var`
                    analysisResult.push({
                        message: `Avoid using 'var' for variable '${declaration.id.name}'. Use 'let' or 'const' instead.`,
                        startLine: node.loc.start.line,
                        endLine: node.loc.end.line,
                    });
                }
            });
            break;

        // Condition 4: Check for `console.log` statements
        case "ExpressionStatement":
            if (
                node.expression.type === "CallExpression" &&
                node.expression.callee.object?.name === "console" &&
                node.expression.callee.property.name === "log"
            ) {
                analysisResult.push({
                    message: `Found 'console.log' statement.`,
                    startLine: node.loc.start.line,
                    endLine: node.loc.end.line,
                });
            }
            break;

        // Condition 5: Detect deeply nested code
        case "BlockStatement":
            if (depth > 3) {
                // Adjust depth threshold as needed
                analysisResult.push({
                    message: `Deeply nested code found.`,
                    startLine: node.loc.start.line,
                    endLine: node.loc.end.line,
                });
            }
            break;

        // Condition 7: Check for arrow functions without parentheses around a single parameter
        case "ArrowFunctionExpression":
            if (
                node.params.length === 1 &&
                node.params[0].type === "Identifier" &&
                !node.params[0].loc
            ) {
                analysisResult.push({
                    message: `Arrow function should have parentheses around its single parameter.`,
                    startLine: node.loc.start.line,
                    endLine: node.loc.end.line,
                });
            }
            break;

        // Add more custom conditions here as needed
    }

    // Recursively walk through children nodes
    for (const key of Object.keys(node)) {
        if (node[key] && typeof node[key] === "object") {
            walkNode(node[key], depth + 1, analysisResult);
        }
    }
}
