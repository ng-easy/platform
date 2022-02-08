import { BuilderContext } from '@angular-devkit/architect';
import { ProjectGraphDependency, ProjectGraphProjectNode } from '@nrwl/tao/src/shared/project-graph';
import { createProjectGraphAsync, ProjectGraph, ProjectGraphNode } from '@nrwl/workspace/src/core/project-graph';
import { pathExists } from 'fs-extra';

export async function getProjectsByTag(
  tag: string,
  context: BuilderContext
): Promise<{ nodes: ProjectGraphNode<any>[]; dependencies: Record<string, ProjectGraphDependency[]> }> {
  if (!(await pathExists('nx.json'))) {
    context.logger.warn(`Project dependencies can only be detected in Nx workspaces, skipping`);
    return { nodes: [], dependencies: {} };
  }

  const projGraph: ProjectGraph<{}> = await createProjectGraphAsync();

  const nodes: ProjectGraphNode<{}>[] = Object.values(projGraph.nodes)
    .filter((node) => node.type === 'lib' && node.data.tags?.includes(tag))
    .filter((node): node is ProjectGraphProjectNode<{}> => (node.data as any).root != null)
    .sort((nodeA, nodeB) => {
      const depsA: ProjectGraphDependency[] | undefined = projGraph.dependencies[nodeA.name];
      const depsB: ProjectGraphDependency[] | undefined = projGraph.dependencies[nodeB.name];

      if (!depsA) {
        return -1;
      } else if (!depsB) {
        return 1;
      } else if (depsB.find((dep) => dep.target === nodeA.name)) {
        return -1;
      } else if (depsA.find((dep) => dep.target === nodeB.name)) {
        return 1;
      }
      return 0;
    });
  const nodeNames = nodes.map((node) => node.name);

  const dependencies: Record<string, ProjectGraphDependency[]> = Object.keys(projGraph.dependencies).reduce((deps, key) => {
    if (nodeNames.includes(key)) {
      deps[key] = projGraph.dependencies[key].filter((dep) => nodeNames.includes(dep.target));
    }
    return deps;
  }, {} as Record<string, ProjectGraphDependency[]>);

  return { nodes, dependencies };
}
