import { BuilderContext } from '@angular-devkit/architect';
import { ProjectGraph, createProjectGraphAsync } from '@nrwl/devkit';
import { pathExists } from 'fs-extra';

import { ProjectDependency } from '../models';

const releaseTarget = 'release';

export async function getProjectDependencies(
  context: BuilderContext,
  project: string,
  mode: 'independent' | 'tag' | 'sync'
): Promise<ProjectDependency[]> {
  if (!(await pathExists('nx.json'))) {
    context.logger.warn(`Project dependencies can only be detected in Nx workspaces, skipping`);
    return [];
  }

  const projGraph: ProjectGraph = await createProjectGraphAsync();
  const dependantProjects: string[] = Object.keys(projGraph.dependencies).filter((dependencyProject) => {
    const dependencies = projGraph.dependencies[dependencyProject].filter((dependency) => dependency.target === project);
    return dependencies.length > 0;
  });

  if (dependantProjects.length > 0) {
    const dependantProjectList = dependantProjects.map((dependencyProject) => `"${dependencyProject}"`).join(', ');
    context.logger.info(`Project "${project}" is a dependency of ${dependantProjectList}`);
  } else {
    context.logger.info(`Project "${project}" is not a dependency for any other project`);
  }

  const dependencies: ProjectDependency[] = Object.values(projGraph.nodes)
    .filter(({ type, data, name }) => {
      if (!dependantProjects.includes(name)) {
        return false;
      } else if (type !== 'lib') {
        context.logger.info(`Ignoring project "${name}" since it is not a library`);
        return false;
      } else if (mode === 'independent' && (!data.targets || !data.targets[releaseTarget] || !data.targets[releaseTarget].executor)) {
        context.logger.info(`Ignoring project "${name}" since it doesn't have a "${releaseTarget}" target`);
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
