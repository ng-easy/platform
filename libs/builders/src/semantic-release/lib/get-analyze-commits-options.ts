export function getAnalyzeCommitsOptions(project: string, mode: 'independent' | 'sync'): any {
  let parserOpts;
  let releaseRules = [
    { type: 'feat', release: 'minor' },
    { type: 'fix', release: 'patch' },
    { type: 'perf', release: 'patch' },
    { type: 'docs', release: 'patch' },
  ];

  if (mode === 'independent') {
    parserOpts = { headerPattern: new RegExp(`^(\\w*)(?:\\((${project}|\\*|deps)\\))?: (.*)$`) };
    releaseRules = releaseRules.map((rule) => ({ ...rule, scope: project }));
  } else {
    parserOpts = { headerPattern: new RegExp(`^(\\w*)(?:\\((\\w*)\\))?: (.*)$`) };
  }

  return { releaseRules, parserOpts };
}
