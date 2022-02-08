import { Context, Options } from 'semantic-release';

export interface InlinePlugin<T extends Options> {
  name: string;
  verifyConditions?(options: T, context: Context): Promise<void>;
  prepare?(options: T, context: Context): Promise<void>;
}

export type InlinePluginSpec<T> = [InlinePlugin<T>, T];
