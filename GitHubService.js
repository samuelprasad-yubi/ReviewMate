class GitHubService {
    constructor(octokit, payload) {
        this.octokit = octokit;
        this.owner = payload.repository.owner.login;
        this.repo = payload.repository.name;
        this.issue_number = payload.pull_request.number;
        this.file_path = payload.comment.path;
        this.head_commit_sha = payload.pull_request.head.sha;
        this.comment_body = payload.comment.body;
        this.comment_id = payload.comment.id;
        this.start_line = payload.comment.start_line || payload.comment.line;
        this.end_line = payload.comment.line;
        this.diffHunk = payload.comment.diff_hunk;
    }

    async getContent() {
        try {
            const { data: fileContentData } =
                await this.octokit.rest.repos.getContent({
                    owner: this.owner,
                    repo: this.repo,
                    path: this.file_path,
                    ref: this.head_commit_sha,
                });
            // eslint-disable-next-line no-undef
            const fileContent = Buffer.from(
                fileContentData.content,
                "base64"
            ).toString("utf-8");
            return fileContent;
        } catch (error) {
            console.log("Error getting file content: ", error);
        }
    }
}

export default GitHubService;
