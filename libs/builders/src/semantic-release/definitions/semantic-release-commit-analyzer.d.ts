declare module '@semantic-release/commit-analyzer' {
  async function analyzeCommits(
    pluginConfig: import('semantic-release').Options,
    context: import('semantic-release').Context
  ): Promise<string | null>;

  export { analyzeCommits };
}
