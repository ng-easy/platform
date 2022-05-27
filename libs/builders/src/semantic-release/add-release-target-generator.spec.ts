import {
  readProjectConfiguration,
  readWorkspaceConfiguration,
  Tree,
  updateProjectConfiguration,
  updateWorkspaceConfiguration,
  WorkspaceConfiguration,
} from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { libraryGenerator } from '@nrwl/workspace';

import { addReleaseTargetGenerator } from './add-release-target-generator';

const executorName = '@ng-easy/builders:semantic-release';

describe('@ng-easy/builders:add-release-target', () => {
  let tree: Tree;

  const defaultOptions: any = {
    skipTsConfig: false,
    includeBabelRc: false,
    unitTestRunner: 'jest',
    skipFormat: false,
    linter: 'eslint',
    testEnvironment: 'jsdom',
    js: false,
    pascalCaseFiles: false,
    strict: true,
    config: 'project',
  };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace(2);
    await libraryGenerator(tree, { ...defaultOptions, name: 'myLib' });
  });

  it('should fail if no default project and no project passed', async () => {
    await expect(() => addReleaseTargetGenerator(tree, {})).rejects.toThrow(
      'No project provided and no default project, pass a project as a parameter.'
    );
  });

  it('should fail release target already exists', async () => {
    await addReleaseTargetGenerator(tree, { project: 'my-lib' });

    await expect(() => addReleaseTargetGenerator(tree, { project: 'my-lib' })).rejects.toThrow(
      `Release target already existing for project "my-lib"`
    );
  });

  it('should add release target to default project', async () => {
    const workspaceConfiguration: WorkspaceConfiguration = readWorkspaceConfiguration(tree);
    workspaceConfiguration.defaultProject = 'my-lib';
    updateWorkspaceConfiguration(tree, workspaceConfiguration);

    await addReleaseTargetGenerator(tree, {});

    const projectConfig = readProjectConfiguration(tree, 'my-lib');
    expect(projectConfig.targets?.release).toMatchObject({
      executor: executorName,
      configurations: {
        local: {
          force: true,
        },
      },
    });
  });

  it('should add release target to project passed trough CLI', async () => {
    await addReleaseTargetGenerator(tree, { project: 'my-lib' });

    const projectConfig = readProjectConfiguration(tree, 'my-lib');
    expect(projectConfig.targets?.release).toMatchObject({
      executor: executorName,
      configurations: {
        local: {
          force: true,
        },
      },
    });
  });

  it('should add release target to project without targets', async () => {
    let projectConfig = readProjectConfiguration(tree, 'my-lib');
    projectConfig.targets = undefined;
    updateProjectConfiguration(tree, 'my-lib', projectConfig);

    await addReleaseTargetGenerator(tree, { project: 'my-lib' });

    projectConfig = readProjectConfiguration(tree, 'my-lib');
    expect(projectConfig.targets?.release).toMatchObject({
      executor: executorName,
      configurations: {
        local: {
          force: true,
        },
      },
    });
  });
});
