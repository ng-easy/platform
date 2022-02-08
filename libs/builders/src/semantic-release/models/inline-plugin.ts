import { Context, Options } from 'semantic-release';

export interface InlinePlugin {
  name: string;
  verifyConditions?(options: Options, context: Context): Promise<void>;
  prepare?(options: Options, context: Context): Promise<void>;
}

export type InlinePluginSpec = InlinePlugin | [InlinePlugin, any];
