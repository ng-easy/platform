import { BuilderContext } from '@angular-devkit/architect';
import { ProjectGraph, createProjectGraphAsync } from '@nrwl/devkit';
import { pathExists } from 'fs-extra';

import { ProjectDependency } from '../models';

export async function getProjectDependencies(context: BuilderContext): Promise<ProjectDependency[]> {
  if (!(await pathExists('nx.json'))) {
    context.logger.warn(`Project dependencies can only be detected in Nx workspaces, skipping`);
    return [];
  }

  const projGraph: ProjectGraph = await createProjectGraphAsync();

  const target = context.target;
  const targetName = context.target?.target;

  if (target == null || targetName == null) {
    context.logger.info('Target is needed to find dependent projects.');
    return [];
  }

  const dependantProjects: string[] = Object.keys(projGraph.dependencies).filter((project) => {
    const dependencies = projGraph.dependencies[project].filter((dependency) => dependency.target === target.project);
    return dependencies.length > 0;
  });

  if (dependantProjects.length > 0) {
    const dependantProjectList = dependantProjects.map((project) => `"${project}"`).join(', ');
    context.logger.info(`Project "${target.project}" is a dependency of ${dependantProjectList}`);
  } else {
    context.logger.info(`Project "${target.project}" is not a dependency of any other project`);
  }

  const dependencies: ProjectDependency[] = Object.values(projGraph.nodes)
    .filter(({ type, data, name }) => {
      if (!dependantProjects.includes(name)) {
        return false;
      } else if (type !== 'lib') {
        context.logger.info(`Ignoring project "${name}" since it is not a library`);
        return false;
      } else if (!data.targets || !data.targets[targetName] || !data.targets[targetName].executor) {
        context.logger.info(`Ignoring project "${name}" since it doesn't have a "${targetName}" target`);
        return false;
      }
      return true;
    })
    .map((node): ProjectDependency => {
      const packageJsonPath = `${node.data.root}/package.json`;
      return {
        project: node.name,
        packageJsonPath,
      };
    });

  return dependencies;
}
