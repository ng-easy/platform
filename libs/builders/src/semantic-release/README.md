# @ng-easy/builders:semantic-release

This builder is a wrapper of [**semantic-release**](https://github.com/semantic-release/semantic-release) that automates the release workflow of Nx/Angular projects. It uses internally:

- [`@semantic-release/commit-analyzer`](https://www.npmjs.com/package/@semantic-release/commit-analyzer)
- [`@semantic-release/release-notes-generator`](https://www.npmjs.com/package/@semantic-release/release-notes-generator)
- [`@semantic-release/changelog`](https://www.npmjs.com/package/@semantic-release/changelog)
- [`@semantic-release/npm`](https://www.npmjs.com/package/@semantic-release/npm)
- [`@semantic-release/github`](https://www.npmjs.com/package/@semantic-release/github)
- [`@semantic-release/git`](https://www.npmjs.com/package/@semantic-release/git)

The configuration of the plugins is opinionated and it includes for configured projects:

- Generating the changelog
- NPM release
- GitHub release
- Update the package version in the source code

## Releasing Projects Independently

### Configuring the Builder

[Conventional commits](https://www.conventionalcommits.org/) follow the pattern `<type>[(optional scope)]: <description>`. When the builder is configured in `independent` mode, only the following commits will considered that apply for the individual project based on the scope:

- No scope, `*` or `deps`
- Those where the scope is equal to the project name
- If the scope is a comma separated list, the project name should be one of the items

Example of `angular.json`/`workspace.json`:

```json
{
  "projects": {
    "library": {
      // Only these commits will be considered:
      //   - feat: new feature
      //   - feat(*): new feature
      //   - feat(deps): upgrade dependency
      //   - feat(library): new feature
      //   - feat(library,some-other-library): new feature
      "targets": {
        "build": {
          /* */
        },
        "release": {
          "builder": "@ng-easy/builders:semantic-release",
          "configurations": {
            "local": {
              "force": true
            }
          }
        }
      }
    }
  }
}
```

Additionally, you can use the following options:

- `dryRun`: defaults to `false`, runs the release process without releasing
- `force`: defaults to `false`, forces the release in a non CI environment, can be used to make a release locally
- `mode`: can be either `independent` or `sync`, defaults to `independent`, choose whether you want to make individual versioning or group all under the same version
- `branches`: branches configuration for workflow release as explained in [`semantic-release` docs](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/workflow-configuration.md#branches-properties), defaults to `["master", "main", "next", { "name": "beta", "prerelease": true }, { "name": "alpha", "prerelease": true }]`
- `releaseCommitMessage`: defaults to `chore(release): :package: \${project}@\${nextRelease.version} [skip ci]\n\n\${nextRelease.notes}`, the message for the release commit to upgrade the changelog and package version, refer to [`semantic-release/git` options](https://github.com/semantic-release/git#options)
- `changelog`: defaults to `true`, generates project's changelog
- `npm`: defaults to `true`, releases to `npm`
- `github`: defaults to `true`, releases to `github`

### Configuring the Nx Workspace

If using Nx, the `release` target has to be run respecting the order of dependencies. That can be configured in the `nx.json` root config file:

```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "cacheableOperations": ["build"],
        "strictlyOrderedTargets": ["build", "release"]
      }
    }
  },
  "targetDependencies": {
    "build": [{ "target": "build", "projects": "dependencies" }],
    "release": [{ "target": "release", "projects": "dependencies" }]
  }
}
```

Dependencies will be calculated using Nx project graph. When `projectA` is a dependency of `projectB` and the first gets upgraded to a new version, it will create a new commit that will bump the version of the latter. It will happen only if both projects are a buildable and publishable library, having the `release` target correctly configured. Please notice that handling dependencies doesn't work in regular Angular workspaces, it requires Nx.

If using just the Angular CLI, make sure to perform releases according to the order of dependencies.

## Releasing Projects In Sync

Previous approach will result in each project having its own independent version, which more clearly aligns with semantic release. However, it is possible that a group of packages needs to be release together with the same version. For this, another builder is provided:

```json
{
  "projects": {
    "workspace": {
      // These commits will be considered:
      //   - feat: new feature
      //   - feat(*): new feature
      //   - feat(deps): upgrade dependency
      //
      // In addition, all projects with the tag "release" will be included, like for example:
      //   - feat(library): new feature
      //   - feat(library,some-other-library): new feature
      "targets": {
        "release": {
          "builder": "@ng-easy/builders:workspace-semantic-release",
          "options": {
            "tag": "release"
          }
        }
      }
    }
  }
}
```

Same options as for `@ng-easy/builders:semantic-release` builder are available. Projects are still build and release in order of dependencies, resulting in multiple commits. However, since commits will affect all projects in the same way, the resulting new version will be the same, hence being in sync. The difference will be the changelog, only changes to the affected project will be listed.

> _Note: When a new project is added to an already existing group, the first time it is released no previous versions are detected, which can result in having an initial version of `1.0.0`. To avoid that, before running the first release, force the corresponding version following the steps described below._

## FAQ

**How can I force a major version?**

Forcing a breaking change:

```shell
git commit -m "feat: :sparkles: bump major version" -m "BREAKING CHANGE New version" --allow-empty
```

**How can I force a specific version bump?**

New versions are calculated based on tags, pushing a new one will result in a new version not following semantic release run:

```shell
git tag {packageName}@{newVersion} # Force a new higher base version
git push --tags
git commit -m "fix({project}): :arrow_up: force version bump" --allow-empty # Force the semantic release process
git push
```

And then do a release.

**What is needed to use a custom authentication?**

The release process needs write permissions to the remote git repo. Please refer to [`semantic-release` authentication docs](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/ci-configuration.md#authentication) on how to setup env variables for your CI.

**How can I configure GitHub CI to run automatically the release?**

Here you can find an example of a [workflow](https://github.com/ng-easy/platform/blob/main/.github/workflows/release.yml), below some details to consider:

```yml
name: Release
on:
  workflow_dispatch: # manual release
  schedule:
    - cron: '0 0 * * *' # scheduled nightly release

jobs:
  npm:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v2.3.4
        with:
          fetch-depth: 0
          persist-credentials: false # Needed so that semantic release can use the admin token

      - name: Fetch latest base branch
        run: git fetch origin main

      # Setup node, install dependencies

      - name: Release
        run: npm run release # nx run-many --target=release --all / ng run project:release
        env:
          CI: true
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.RELEASE_TOKEN }} # Personal access token with repo permissions

      # Alternative using GitHub action
      - name: Release
        uses: mansagroup/nrwl-nx-action@v2
        with:
          targets: release
          nxCloud: 'true'
        env:
          CI: true
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.RELEASE_TOKEN }} # Personal access token with repo permissions
```

**When creating a new project to be released, it results in a lot of noise on previous PRs and a log initial changelog. How can I avoid that?**

It is expected, since it will reflect the history of the repo. If you don't want that to happen, use steps above to force an initial version by pushing a tag like `{packageName}@0.9.0` to git so that it serves as the baseline.
