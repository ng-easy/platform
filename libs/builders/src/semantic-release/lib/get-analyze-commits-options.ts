interface ParserOptions {
  headerPattern: RegExp;
}

interface ReleaseRule {
  type: string;
  release: string;
  scope?: string;
}

interface AnalyzeCommitsOptions {
  releaseRules: ReleaseRule[];
  parserOpts: ParserOptions;
}

const baseReleaseRules: ReleaseRule[] = [
  { type: 'feat', release: 'minor' },
  { type: 'fix', release: 'patch' },
  { type: 'perf', release: 'patch' },
  { type: 'docs', release: 'patch' },
];

export function getAnalyzeCommitsOptions(projects: string[], mode: 'independent' | 'sync' | 'group'): AnalyzeCommitsOptions {
  let parserOpts: ParserOptions;
  let releaseRules: ReleaseRule[];

  if (mode === 'independent' || mode === 'group') {
    parserOpts = {
      headerPattern: new RegExp(`^(\\w*)(?:\\((${projects.map((project) => escapeRegExp(project)).join('|')}|\\*|deps)\\))?: (.*)$`),
    };
    releaseRules = [];
    projects.forEach((project) => {
      baseReleaseRules.forEach((rule) => releaseRules.push({ ...rule, scope: project }));
    });
  } else {
    parserOpts = { headerPattern: new RegExp(`^(\\w*)(?:\\(([^:]*)\\))?: (.*)$`) };
    releaseRules = baseReleaseRules;
  }

  return { releaseRules, parserOpts };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
