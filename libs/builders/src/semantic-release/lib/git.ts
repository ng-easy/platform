import { execa } from 'execa';

export async function getGitCurrentSha(): Promise<string> {
  const { stdout } = await execa('git', ['log', '-n', '1']);
  return stdout;
}

export async function getGitRemoteHeadSha(): Promise<string> {
  const { stdout } = await execa('git', ['log', '-n', '1', 'origin/HEAD']);
  return stdout;
}

export async function getGitStatus(): Promise<string> {
  const { stdout } = await execa('git', ['status']);
  return stdout;
}

export async function getGitPullRebase(): Promise<string> {
  await execa('git', ['fetch', 'origin', 'HEAD']);
  const { stdout } = await execa('git', ['pull', '--rebase']);
  return stdout;
}
