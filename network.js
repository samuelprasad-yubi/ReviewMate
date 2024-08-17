export const connectLLm = async ({ prompt, options = {} }) => {
    return await fetch("https://ml-ollama-qa.go-yubi.in/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama3:latest",
            prompt,
            stream: false,
            temperature: 0.8,
            ...options,
        }),
    }).then((response) => response.json());
};
