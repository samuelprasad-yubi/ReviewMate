/* eslint-disable no-console */
import { addPatchEndComment, generateCommentData } from "../helper.js";
import { connectLLm } from "../network.js";
import { reviewFileDiffFunPrompt } from "../prompts.js";
import { parseReview } from "../utils.js";

class ReviewService {
    constructor(githubService, octokit) {
        this.reviewComments = [];
        this.githubService = githubService;
        this.octokit = octokit;
    }

    addCommentsToBuffer = (fileName, parsedReviewComments) => {
        parsedReviewComments
            .filter((p) => p.endLine && p.startLine && p.comment)
            .forEach((review) => {
                this.reviewComments.push({
                    path: fileName,
                    ...review,
                });
            });
    };

    byAI = async (filteredFiles) => {
        for (const filteredFile of filteredFiles) {
            await this.processFilePatches(filteredFile);
        }
    };

    processFilePatches = async (filteredFile) => {
        const patchText = filteredFile.patches
            .map((patch) => {
                return addPatchEndComment(patch.hunksStr);
            })
            .join("\n");

        const prompt = reviewFileDiffFunPrompt({
            fileName: filteredFile.file.filename,
            patch: patchText,
            content: filteredFile.fileContent,
        });

        // console.log("prompt", { prompt });
        try {
            const data = await connectLLm({
                prompt,
                options: { format: "json" },
            });

            const parsedReviewComments = this.parseLLMResponse(
                data,
                filteredFile.patches
            );

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
        } catch (e) {
            console.log(e);
        }
    };

    parseLLMResponse = (data, patches) => {
        try {
            console.log("response", { response: data.response });

            const parseGenResponse = JSON.parse(data.response);
            if (
                parseGenResponse?.data &&
                Array.isArray(parseGenResponse?.data)
            ) {
                const filteredParseGenResponse = parseGenResponse.data.filter(
                    (item) => {
                        return (
                            item?.startLine && item?.endLine && item?.comment
                        );
                    }
                );

                // console.log("filteredParseGenResponse", {
                //     filteredParseGenResponse,
                //     patches,
                // });
                return parseReview(filteredParseGenResponse, patches);
            }
        } catch (error) {
            console.error("Error parsing LLM response:", error);
        }
        return [];
    };

    submitReviewCommentsToPr = async () => {
        await this.submitReviewComments(this.reviewComments);
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
}

export default ReviewService;
