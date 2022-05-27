import {
  Tree,
  readProjectConfiguration,
  readWorkspaceConfiguration,
  WorkspaceConfiguration,
  ProjectConfiguration,
  updateProjectConfiguration,
  formatFiles,
  convertNxGenerator,
} from '@nrwl/devkit';

export interface AddReleaseTargetSchema {
  project?: string;
}

export async function addReleaseTargetGenerator(tree: Tree, schema: AddReleaseTargetSchema) {
  const workspaceConfiguration: WorkspaceConfiguration = readWorkspaceConfiguration(tree);
  const project: string | undefined = schema.project ?? workspaceConfiguration.defaultProject;

  if (project == null) {
    throw new Error(`No project provided and no default project, pass a project as a parameter.`);
  }

  const projectConfiguration: ProjectConfiguration = readProjectConfiguration(tree, project);
  const targets = projectConfiguration.targets ?? {};

  if (targets['release'] != null) {
    throw new Error(`Release target already existing for project "${project}"`);
  }

  targets['release'] = {
    executor: '@ng-easy/builders:semantic-release',
    configurations: {
      local: {
        force: true,
      },
    },
  };

  projectConfiguration.targets = targets;

  updateProjectConfiguration(tree, project, projectConfiguration);

  await formatFiles(tree);
}

export default addReleaseTargetGenerator;
export const addReleaseTargetSchematic = convertNxGenerator(addReleaseTargetGenerator);
