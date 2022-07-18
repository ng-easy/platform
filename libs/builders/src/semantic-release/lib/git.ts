import { importEsm } from '../../core';

export async function getGitCurrentSha(): Promise<string> {
  const { execa } = await importEsm('execa');
  const { stdout } = await execa('git', ['rev-parse', 'HEAD']);
  return stdout;
}

export async function getGitRemoteHeadSha(): Promise<string> {
  const { execa } = await importEsm('execa');
  const repoUrl = await getGitRepoUrl();
  const currentBranch = await getGitCurrentBranch();
  const { stdout } = await execa('git', ['ls-remote', '--heads', repoUrl, currentBranch]);
  return stdout;
}

export async function getGitStatus(): Promise<string> {
  const { execa } = await importEsm('execa');
  const { stdout } = await execa('git', ['status']);
  return stdout;
}

export async function getGitPullRebase(): Promise<string> {
  const { execa } = await importEsm('execa');
  const { stdout: outFetch } = await execa('git', ['fetch']);
  const { stdout: outRebase } = await execa('git', ['pull', '--rebase']);
  return `${outFetch}\n${outRebase}`;
}

export async function getGitRepoUrl(): Promise<string> {
  const { execa } = await importEsm('execa');
  const { stdout } = await execa('git', ['config', '--get', 'remote.origin.url']);
  return stdout;
}

export async function getGitCurrentBranch(): Promise<string> {
  const { execa } = await importEsm('execa');
  const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  return stdout;
}
