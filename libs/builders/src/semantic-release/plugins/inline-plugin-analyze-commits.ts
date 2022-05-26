import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { Context, Commit } from 'semantic-release';

import { AnalyzeCommitsOptions, getAnalyzeCommitsOptions } from '../lib';
import { InlinePlugin, ReleaseProjectOptions } from '../models';

async function inlineAnalyzeCommits(releaseOptions: ReleaseProjectOptions, context: Context): Promise<string | null> {
  context.logger.log(`Nx Analyze Commits Plugin: VAnalyze Commits`);

  const projects: string[] = [...new Set([releaseOptions.project, ...releaseOptions.relatedProjects])];
  const analyzeCommitOptions: AnalyzeCommitsOptions = getAnalyzeCommitsOptions(projects, releaseOptions.mode);

  context.logger.log(`Regex to match commits: ${analyzeCommitOptions.parserOpts.headerPattern.source}`);
  context.logger.log('');

  context.commits = filterCommits(context.commits ?? [], analyzeCommitOptions.parserOpts.headerPattern);

  return await analyzeCommits(analyzeCommitOptions, context);
}

export const inlinePluginAnalyzeCommits: InlinePlugin<ReleaseProjectOptions> = {
  analyzeCommits: inlineAnalyzeCommits,
  name: 'analyze-commits',
};

function filterCommits(commits: Commit[], headerPattern: RegExp): Commit[] {
  return commits.filter((commit) => headerPattern.test(commit.subject));
}
