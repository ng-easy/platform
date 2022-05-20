import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { Context, Commit } from 'semantic-release';

import { AnalyzeCommitsOptions, getAnalyzeCommitsOptions } from '../lib';
import { InlinePlugin, ReleaseOptions } from '../models';

async function inlineAnalyzeCommits(releaseOptions: ReleaseOptions, context: Context): Promise<string | null> {
  const projects = releaseOptions.projects.map(({ project }) => project);
  const analyzeCommitOptions: AnalyzeCommitsOptions = getAnalyzeCommitsOptions(projects, releaseOptions.mode);

  context.logger.log(`Regex to match commits: ${analyzeCommitOptions.parserOpts.headerPattern.source}`);
  context.logger.log('');

  context.commits = filterCommits(context.commits ?? [], analyzeCommitOptions.parserOpts.headerPattern);

  return await analyzeCommits(analyzeCommitOptions, context);
}

export const inlinePluginAnalyzeCommits: InlinePlugin<ReleaseOptions> = { analyzeCommits: inlineAnalyzeCommits, name: 'analyze-commits' };

function filterCommits(commits: Commit[], headerPattern: RegExp): Commit[] {
  return commits.filter((commit) => headerPattern.test(commit.subject));
}
