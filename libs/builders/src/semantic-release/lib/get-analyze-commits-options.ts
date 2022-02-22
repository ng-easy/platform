export interface ParserOptions {
  headerPattern: RegExp;
}

export interface ReleaseRule {
  type: string;
  release: string;
  scope?: string;
}

export interface AnalyzeCommitsOptions {
  releaseRules: ReleaseRule[];
  parserOpts: ParserOptions;
}

const releaseRules: ReleaseRule[] = [
  { type: 'feat', release: 'minor' },
  { type: 'fix', release: 'patch' },
  { type: 'perf', release: 'patch' },
  { type: 'docs', release: 'patch' },
];

export function getAnalyzeCommitsOptions(projects: string[], mode: 'independent' | 'sync' | 'group'): AnalyzeCommitsOptions {
  let headerPattern: RegExp;

  if (mode === 'independent' || mode === 'group') {
    headerPattern = new RegExp(
      `^(\\w*)(?:\\(([^:]*,)*(${projects.map((project) => escapeRegExp(project)).join('|')}|\\*|deps)(,[^:]*)*\\))?: (.*)$`
    );
  } else {
    headerPattern = new RegExp(`^(\\w*)(?:\\(([^:]*)\\))?: (.*)$`);
  }

  return { releaseRules, parserOpts: { headerPattern } };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
