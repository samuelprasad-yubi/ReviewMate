import { connectLLm } from "./network.js";
import { getPromptPrDescription } from "./prompts.js";

export const getPRSummary = async ({ files }) => {
    try {
        const prompt = getPromptPrDescription(files);
        const data = await connectLLm({ prompt });
        return data.choices[0].message.content;
    } catch (e) {
        console.log("Error fetching summary", e);
        return "";
    }
};
