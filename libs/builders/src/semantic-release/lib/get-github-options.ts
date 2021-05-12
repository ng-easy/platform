export function getGithubOptions(outputPath: string, packageName: string): any {
  return { addReleases: 'bottom', assets: [{ path: `${outputPath}-tar/*.*` }], successComment: getSuccessComment(packageName) };
}

function getSuccessComment(packageName: string): string {
  return `
:tada: This \${issue.pull_request ? 'PR is included' : 'issue has been resolved'} in version **${packageName}@\${nextRelease.version}** :tada:

The release is available on:
\${releases.map((release) => '- [' + release.name + '](' + release.url + ') :package::rocket:').join('\\n') }
`.trim();
}
