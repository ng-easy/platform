export interface ParserOptions {
  headerPattern: RegExp;
  breakingHeaderPattern?: RegExp;
}

export interface ReleaseRule {
  breaking?: true;
  type?: string;
  release: string | false;
  scope?: string;
}

export interface AnalyzeCommitsOptions {
  releaseRules: ReleaseRule[];
  parserOpts: ParserOptions;
}

const defaultReleaseRules: readonly ReleaseRule[] = [
  { type: 'feat', release: 'minor' },
  { type: 'fix', release: 'patch' },
  { type: 'perf', release: 'patch' },
  { type: 'docs', release: 'patch' },
];

const sharedScopes: readonly string[] = ['\\*', 'deps']; // escape for micromatch

export function getAnalyzeCommitsOptions(projects: string[], mode: 'independent' | 'sync' | 'group'): AnalyzeCommitsOptions {
  let headerPattern: RegExp;
  const releaseRules: ReleaseRule[] = [{ breaking: true, release: 'major' }];

  if (mode === 'independent' || mode === 'group') {
    // Build release rules
    releaseRules.push({ scope: '*', release: false }); // ignore commits from other scopes, if later they match last wins
    [...projects, ...sharedScopes].forEach((project) => {
      defaultReleaseRules.forEach((defaultReleaseRule) => {
        releaseRules.push({ ...defaultReleaseRule, scope: project });
      });
    });

    // make sure to get a match for breaking changes to avoid default rules to apply
    releaseRules.push({ breaking: true, release: 'major' });

    // Build header pattern
    headerPattern = new RegExp(
      `^(\\w*)(?:\\(.*(?<![a-zA-Z\\-])(${projects.map((project) => escapeRegExp(project)).join('|')}|deps|\\*)(?![a-zA-Z\\-]).*\\))?: (.*)$`
    );
  } else {
    headerPattern = new RegExp(`^(\\w*)(?:\\(([^:]*)\\))?: (.*)$`);
  }

  return { releaseRules, parserOpts: { headerPattern } };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
