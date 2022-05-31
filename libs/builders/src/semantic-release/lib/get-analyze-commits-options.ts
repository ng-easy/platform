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

const allowedProjectName = '[a-zA-Z\\-]';
const allowedProjectNameRegex = new RegExp(`^${allowedProjectName}+$`);
const sharedScopes: readonly string[] = ['\\*', 'deps']; // escape for micromatch and regex

export function getAnalyzeCommitsOptions(projects: string[], root: boolean = false): AnalyzeCommitsOptions {
  let headerPattern: RegExp;
  const releaseRules: ReleaseRule[] = [{ breaking: true, release: 'major' }];

  projects.forEach((project) => {
    if (!allowedProjectNameRegex.test(project)) {
      throw new Error(`Project "${project}" does not have a supported name for the builder, it should match ${allowedProjectName}`);
    }
  });

  if (root) {
    headerPattern = new RegExp(`^(\\w*)(?:\\(([^:]*)\\))?: (.*)$`);
  } else {
    // Build release rules
    releaseRules.push({ scope: '*', release: false }); // ignore commits from other scopes, if later they match last wins
    [...projects, ...sharedScopes].forEach((project) => {
      defaultReleaseRules.forEach((defaultReleaseRule) => {
        releaseRules.push({ ...defaultReleaseRule, scope: project });
      });
    });

    // make sure to get a match for breaking changes to avoid default rules to apply
    releaseRules.push({ breaking: true, release: 'major' });
    const projectRegex = projects
      .map((project) => escapeRegExp(project))
      .concat(sharedScopes)
      .join('|');

    // Build header pattern
    headerPattern = new RegExp(`^(\\w*)(?:\\(.*(?<!${allowedProjectName})(${projectRegex})(?!${allowedProjectName}).*\\))?: (.*)$`);
  }

  return { releaseRules, parserOpts: { headerPattern } };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
