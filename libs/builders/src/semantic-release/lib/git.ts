import { importEsm } from '../../core';

export async function getGitCurrentSha(): Promise<string> {
  const { execa } = await importEsm('execa');
  const { stdout } = await execa('git', ['rev-parse', 'HEAD']);
  return stdout;
}

export async function getGitRemoteHeadSha(): Promise<string> {
  const { execa } = await importEsm('execa');
  const { stdout } = await execa('git', ['rev-parse', 'origin/HEAD']);
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
