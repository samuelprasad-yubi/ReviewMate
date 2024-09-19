import { connectLLm } from "./network.js";
import { getPromptPrDescription } from "./prompts.js";

export const updatePrDescriptionWithSummary = async (
    files,
    githubService,
    prDescription
) => {
    const prompt = getPromptPrDescription(files);
    console.log("prompt>>>>>", prompt);
    const data = await connectLLm({ prompt });
    const updatedDescription = `${data.response}
      
           ${prDescription}
    `;
    await githubService.updatePrDescription(updatedDescription);
    return data.response;
};
