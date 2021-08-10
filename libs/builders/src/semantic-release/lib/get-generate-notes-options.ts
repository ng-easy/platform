import { Commit } from 'semantic-release';

interface SemanticReleaseCommitNotes {
  title: string;
}

interface SemanticReleaseReference {
  issue: number;
}

interface SemanticReleaseCommit extends Commit {
  notes: SemanticReleaseCommitNotes[];
  type: string;
  scope: string | null;
  shortHash: string;
  references: SemanticReleaseReference[];
  revert: boolean;
}

interface SemanticReleaseContext {
  repository?: string;
  host: string;
  owner: string;
  repoUrl: string;
}

export function getGenerateNotesOptions(project: string): any {
  return {
    writerOpts: {
      transform(commit: SemanticReleaseCommit, context: SemanticReleaseContext): SemanticReleaseCommit | undefined {
        let discard = true;
        const issues: number[] = [];

        commit.notes.forEach((note: SemanticReleaseCommitNotes) => {
          note.title = 'BREAKING CHANGES';
          discard = false;
        });

        if (commit.type === 'feat') {
          commit.type = 'Features';
        } else if (commit.type === 'fix') {
          commit.type = 'Bug Fixes';
        } else if (commit.type === 'perf') {
          commit.type = 'Performance Improvements';
        } else if (commit.type === 'revert' || commit.revert) {
          commit.type = 'Reverts';
        } else if (commit.type === 'docs') {
          commit.type = 'Documentation';
        } else if (discard) {
          return;
        } else if (commit.type === 'style') {
          commit.type = 'Styles';
        } else if (commit.type === 'refactor') {
          commit.type = 'Refactor';
        } else if (commit.type === 'test') {
          commit.type = 'Tests';
        } else if (commit.type === 'build') {
          commit.type = 'Build System';
        } else if (commit.type === 'ci') {
          commit.type = 'Continuous Integration';
        }

        if (commit.scope === '*' || commit.scope === 'deps') {
          commit.scope = '';
        }

        if (typeof commit.hash === 'string') {
          commit.shortHash = commit.hash.substring(0, 7);
        }

        if (typeof commit.subject === 'string') {
          let url: string = context.repository ? `${context.host}/${context.owner}/${context.repository}` : context.repoUrl;

          if (url) {
            url = `${url}/issues/`;
            // Issue URLs
            commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue: number) => {
              issues.push(issue);
              return `[#${issue}](${url}${issue})`;
            });
          }

          if (context.host) {
            // User URLs
            commit.subject = commit.subject.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username: string) => {
              if (username.includes('/')) {
                return `@${username}`;
              }

              return `[@${username}](${context.host}/${username})`;
            });
          }
        }

        commit.references = commit.references.filter((reference: SemanticReleaseReference) => issues.indexOf(reference.issue) === -1);

        if (commit.scope == null) {
          return commit; // Workspace wide commit, consider it
        }

        if (commit.scope !== '' && commit.scope !== project) {
          return; // Omit commit if project is not included in scope
        }

        return commit;
      },
    },
  };
}
