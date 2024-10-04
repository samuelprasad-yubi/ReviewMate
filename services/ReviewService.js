/* eslint-disable no-console */
import { addPatchEndComment, generateCommentData } from "../helper.js";
import { connectLLm, responseSchema } from "../network.js";
import {
    reviewFileDiffFunPrompt,
    // summarizeIntoShortDescription,
} from "../prompts.js";
import { parseReview } from "../utils.js";

class ReviewService {
    constructor(githubService, octokit) {
        this.reviewComments = [];
        this.githubService = githubService;
        this.octokit = octokit;
        this.fileSummaries = [];
    }

    addCommentsToBuffer = (fileName, parsedReviewComments) => {
        parsedReviewComments
            .map((review) => ({
                startLine: review.startLine || 1,
                endLine: review.endLine || 1,
                comment: review.comment,
            }))
            .filter((p) => !!p.comment)
            .forEach((review) => {
                this.reviewComments.push({
                    path: fileName,
                    ...review,
                });
            });
    };

    byAI = async ({ filteredFiles }) => {
        for (const filteredFile of filteredFiles) {
            await this.processFilePatches(filteredFile);
        }
    };

    processFilePatches = async (filteredFile) => {
        try {
            // console.log("processFilePatches");
            const patchText = filteredFile.patches
                .map((patch) => {
                    return addPatchEndComment(patch.hunksStr);
                })
                .join("\n");
            //summarizeIntoShortDescription
            // const summary = await connectLLm({
            //     prompt: summarizeIntoShortDescription(filteredFile),
            //     options: { system: "programmer" },
            // });
            // console.log("patchText>>>>", patchText);
            const prompt = reviewFileDiffFunPrompt({
                fileName: filteredFile.file.filename,
                patch: patchText,
                content: filteredFile.fileContent,
                // summary: summary.response,
            });

            // console.log("prompt", { prompt });

            const data = await connectLLm({
                prompt,
                responseSchema,
            });
            console.log("data", data);
            console.log(
                "data message.content",
                data.choices[0].message.content
            );
            const response = data.choices[0].message.content;
            const parseGenResponse = JSON.parse(response);

            const parsedReviewComments = this.parseLLMResponse({
                parseGenResponse,
                filteredFile,
            });

            // const data2 = await connectLLm({
            //     prompt,
            //     options: { format: "json", model: "codellama:7b" },
            // });

            // const parsedReviewComments2 = this.parseLLMResponse(
            //     data2,
            //     filteredFile.patches
            // );
            // console.log({ parsedReviewComments });
            this.addCommentsToBuffer(filteredFile.file.filename, [
                ...parsedReviewComments,
                // ...parsedReviewComments2,
            ]);

            if (this.reviewComments.length >= 10) {
                await this.submitReviewCommentsToPr();
                this.reviewComments = [];
            }
            // console.log("processFilePatches  end");
        } catch (e) {
            console.log(e);
        }
    };

    parseLLMResponse = ({ parseGenResponse, filteredFile }) => {
        try {
            // console.log("response>>>", { response });
            console.log("parseGenResponse", { parseGenResponse });

            if (parseGenResponse?.fileSummary) {
                this.fileSummaries.push({
                    filteredFile: filteredFile,
                    fileSummary: parseGenResponse.fileSummary,
                });
            }

            if (!Array.isArray(parseGenResponse?.reviews)) return [];

            const filteredParseGenResponse = parseGenResponse.reviews
                .map((item) => ({
                    startLine: item.startLine || 1,
                    endLine: item.endLine || 1,
                    ...item,
                }))
                .filter((item) => !!item?.comment);
            return parseReview(filteredParseGenResponse, filteredFile.patches);
        } catch (error) {
            console.error("Error parsing LLM response:", error);
        }
        return [];
    };

    submitReviewCommentsToPr = async () => {
        await this.submitReviewComments(this.reviewComments);
    };

    submitReviewCommentsToPrWhenCommentLessThan = async ({ count }) => {
        if (this.reviewComments.length < count) {
            console.log("submitting review comments");
            await this.submitReviewComments(this.reviewComments);
            this.reviewComments = [];
        }
    };
    submitReviewComments = async (reviewCommentsBuffer) => {
        try {
            if (reviewCommentsBuffer.length === 0) {
                await this.githubService.createReviewDescription({
                    body: "No review comments generated.",
                });
                return;
            }

            const comments = reviewCommentsBuffer.map(generateCommentData);
            const review =
                await this.githubService.createReviewComments(comments);

            if (review) {
                await this.githubService.submitReview({
                    reviewId: review.data.id,
                    body: "Review comments added",
                });
            }
        } catch (error) {
            console.error("Error submitting review comments:", error);
        }
    };

    getFileSummaries = () => {
        return this.fileSummaries;
    };
}

export default ReviewService;
