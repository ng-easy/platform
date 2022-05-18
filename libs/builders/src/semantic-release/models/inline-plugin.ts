import { Context, Options } from 'semantic-release';

export interface InlinePlugin<T extends Options> {
  name: string;
  analyzeCommits?(options: T, context: Context): Promise<string | null>;
  verifyConditions?(options: T, context: Context): Promise<void>;
  prepare?(options: T, context: Context): Promise<void>;
}

export type InlinePluginSpec<T extends Options> = [InlinePlugin<T>, T];
