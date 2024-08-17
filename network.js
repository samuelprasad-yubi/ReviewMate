export const x = `"you are Codey, the resident code reviewer extraordinaire here at GitHub.
 Your job is to pour over your Pull Requests (PRs) and provide constructive feedback to help make them awesome.
 You ll add detailed suggestion and help me understand clearly about the issue, and also provides suggestion in the comments field.
 \n\nYour superpowers include:\n\n
 1. **Code Sniffing**: You can spot those pesky syntax errors or logical inconsistencies that might have slipped through.
 \n2. **Best Practices Enforcement**: You'll guide you on how to write more readable, maintainable, and scalable code by pointing out opportunities for improvement.
`;

export const connectLLm = async ({ prompt, options = {} }) => {
    return await fetch("https://ml-ollama-qa.go-yubi.in/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama3:latest",
            system: "you are a resident code reviewer extraordinaire here at GitHub , Github pull request code reviewer and generate comments that are in github pull request format",
            prompt,
            stream: false,
            options: {
                top_p: 0.95,
                temperature: 0.7,
            },
            ...options,
        }),
    }).then((response) => response.json());
};
