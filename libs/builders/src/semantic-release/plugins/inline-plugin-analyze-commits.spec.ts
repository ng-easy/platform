import { Commit, Context } from 'semantic-release';

import { getAnalyzeCommitsOptions } from '../lib';
import { InlinePlugin, ReleaseProjectOptions } from '../models';
import { inlinePluginAnalyzeCommits } from './inline-plugin-analyze-commits';

type Logger = Context['logger'];
const breakingChangeMessage = 'BREAKING CHANGE this is breaking';

describe('@ng-easy/builders:semantic-release', () => {
  describe('analyzeCommits', () => {
    let logger: Logger;
    let context: Context;
    let analyzeCommits: NonNullable<InlinePlugin<ReleaseProjectOptions>['analyzeCommits']>;

    function addCommit(subject: string, body?: string, breakingChange?: string) {
      body ??= '';
      context.commits?.push({ subject, body, message: `${subject}\n\n${body}\n\n${breakingChange}` } as Commit);
    }

    function getReleaseOptions(
      project: string,
      root: ReleaseProjectOptions['root'] = false,
      relatedProjects: string[] = []
    ): ReleaseProjectOptions {
      return { root, project, relatedProjects } as ReleaseProjectOptions;
    }

    beforeEach(() => {
      logger = { log: jest.fn(), error: jest.fn() };
      context = { logger, env: {}, commits: [] };
      if (inlinePluginAnalyzeCommits.analyzeCommits) {
        analyzeCommits = inlinePluginAnalyzeCommits.analyzeCommits;
      }
    });

    describe('individual project', () => {
      it('should consider no update if there is no match', async () => {
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBeNull();
      });

      it('should consider no update if there is a chore change', async () => {
        addCommit('chore(project): chore');
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBeNull();
      });

      it('should consider patch update if there is a fix commit', async () => {
        addCommit('fix(project): fix');
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBe('patch');
      });

      it('should consider minor update if there is a feat commit', async () => {
        addCommit('fix(project): this should be overridden');
        addCommit('feat(project): feat');
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBe('minor');
      });

      it('should consider major update if there is a breaking change', async () => {
        addCommit('fix(project): this should be a breaking', '', breakingChangeMessage);
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBe('major');
      });

      it('should consider the update if the scope applies to all projects', async () => {
        addCommit('fix(*): fix');
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBe('patch');
      });

      it('should consider the update if the scope applies is dependencies', async () => {
        addCommit('fix(deps): fix');
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBe('patch');
      });

      it('should consider no update if the scope applies to another project', async () => {
        addCommit('fix(another-project): fix');
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBeNull();
      });

      it('should not consider the update if the scope applies to another project when a change is breaking', async () => {
        addCommit('fix(another-project): fix with breaking', '', breakingChangeMessage);
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBeNull();
      });

      it('should consider update when multiple projects are used', async () => {
        addCommit('fix(another-project): fix');
        const options = getReleaseOptions('project', false, ['another-project']);

        expect(await analyzeCommits(options, context)).toBe('patch');
      });

      it('should consider update when the scope has multiple projects', async () => {
        addCommit('fix(another-project,project): fix');
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBe('patch');
      });

      it('should consider update when there is no scope', async () => {
        addCommit('fix: fix');
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBe('patch');
      });

      it('should consider update when there is no scope and a breaking change', async () => {
        addCommit('fix: fix', '', breakingChangeMessage);
        const options = getReleaseOptions('project');

        expect(await analyzeCommits(options, context)).toBe('major');
      });

      it('should not support invalid project names', () => {
        expect(() => {
          getAnalyzeCommitsOptions(['01891$']);
        }).toThrow();
      });
    });
  });
});
