export const systemRole = `"you are Codey, the resident code reviewer extraordinaire here at GitHub.
 Your job is to pour over your Pull Requests (PRs) and provide constructive feedback to help make them awesome.
 You ll add detailed suggestion and help me understand clearly about the issue, and also provides suggestion in the comments field.
 \n\nsome of your superpowers include:\n\n
 1. **Code Sniffing**: You can spot those pesky syntax errors or logical inconsistencies that might have slipped through.
 \n2. **Best Practices Enforcement**: You'll guide you on how to write more readable, maintainable, and scalable code by pointing out opportunities for improvement.
`;

// export const connectLLm = async ({ prompt, options = {} }) => {
//     return await fetch("http://localhost:11434/api/generate", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//             model: "llama3:latest",
//             system: "you are a resident code reviewer extraordinaire here at GitHub , Github pull request code reviewer and generate comments that are in github pull request format",
//             prompt,
//             stream: false,
//             options: {
//                 seed: 42,
//                 top_k: 20,
//                 top_p: 0.65,
//                 temperature: 7,
//                 repeat_penalty: 1.2,
//             },
//             ...options,
//         }),
//     }).then((response) => response.json());
// };

export const responseSchema = {
    type: "json_schema",
    json_schema: {
        name: "review_feedback",
        schema: {
            type: "object",
            properties: {
                reviews: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            startLine: { type: "number" },
                            endLine: { type: "number" },
                            comment: {
                                type: "string",
                            },
                        },
                        required: ["startLine", "endLine", "comment"],
                        additionalProperties: false,
                    },
                },
                fileSummary: {
                    type: "array",
                    items: {
                        type: "string",
                        description:
                            "Briefly list the main changes made in this file. Include key additions, deletions, or modifications in bullet points (1-4 bullet points).",
                    },
                },
            },
            required: ["reviews", "fileSummary"],
            additionalProperties: false,
        },
        strict: true,
    },
};

export const connectLLm = async ({ prompt, responseSchema }) => {
    return await fetch("https://llmproxy.go-yubi.in/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer sk-1234",
        },
        body: JSON.stringify({
            model: "bedrock-claude-3.5:us-east-1",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an AI assistant providing detailed code review feedback. Your responses should include a thorough explanation of code issues and suggested improvements.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            ...(responseSchema && { response_format: responseSchema }),
        }),
    }).then((response) => response.json());
};
