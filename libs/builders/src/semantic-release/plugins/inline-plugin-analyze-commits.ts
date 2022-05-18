import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { Context } from 'semantic-release';

import { AnalyzeCommitsOptions, getAnalyzeCommitsOptions } from '../lib';
import { InlinePlugin, ReleaseOptions } from '../models';

async function inlineAnalyzeCommits(releaseOptions: ReleaseOptions, context: Context): Promise<string | null> {
  const projects = releaseOptions.projects.map(({ project }) => project);
  const analyzeCommitOptions: AnalyzeCommitsOptions = getAnalyzeCommitsOptions(projects, releaseOptions.mode);

  context.logger.log(`Regex to match commits: ${analyzeCommitOptions.parserOpts.headerPattern.source}`);
  context.logger.log('');

  return await analyzeCommits(analyzeCommitOptions, context);
}

export const inlinePluginAnalyzeCommits: InlinePlugin<ReleaseOptions> = { analyzeCommits: inlineAnalyzeCommits, name: 'analyze-commits' };
