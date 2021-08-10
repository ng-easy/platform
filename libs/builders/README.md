# @ng-easy/builders

[![CI](https://github.com/ng-easy/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ng-easy/platform/actions/workflows/ci.yml) [![npm latest version](https://img.shields.io/npm/v/@ng-easy/builders/latest.svg)](https://www.npmjs.com/package/@ng-easy/builders) [![README](https://img.shields.io/badge/README--green.svg)](/libs/builders/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/libs/builders/CHANGELOG.md) ![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)

Builders for [Nx](https://nx.dev) and [Angular](https://angular.io) projects.

## image-optimizer

This builder is a wrapper of [`@ng-easy/image-optimizer`](https://github.com/ng-easy/platform/tree/main/libs/image-optimizer) designed to generate build time optimized images from an assets folder.

A suggested configuration would be to place original images in a separate folder and make the output path the standard assets folder of the project and include them in the repo. This way it will integrate nicely with [Nx](https://nx.dev/)/[Angular](https://angular.io/) build process without need for build orchestration.

### Configuration of the builder

In your `angular.json`/`workspace.json` you can use the builder with:

```json
"optimize-images": {
  "builder": "@ng-easy/builders:image-optimizer",
  "options": {
    "assets": ["src/assets/original-images"],
    "outputPath": "src/assets/optimized-images"
  }
}
```

- `assets`: folders containing source images
- `outputPath`: where optimized images will be saved
- `deviceSizes`: expected device widths from the users of your website used in responsive of fill layouts, defaults to `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]`
- `imageSizes`: image sizes when using fixed or intrinsic layouts, should be smaller and different from device sizes, defaults to `[16, 32, 48, 64, 96, 128, 256, 384]`
- `quality`: Quality of optimized images between `10` and `100`, defaults to `75`
- `formats`: optimized output formats, can be `png`, `jpeg`, `webp`, `avif` or `heif`, defaults to `["jpeg", "webp"]`

## semantic-release

This builder is a wrapper of [**semantic-release**](https://github.com/semantic-release/semantic-release) to automate the release process of Angular projects. It uses internally:

- [`@semantic-release/commit-analyzer`](https://www.npmjs.com/package/@semantic-release/commit-analyzer)
- [`@semantic-release/release-notes-generator`](https://www.npmjs.com/package/@semantic-release/release-notes-generator)
- [`@semantic-release/changelog`](https://www.npmjs.com/package/@semantic-release/changelog)
- [`@semantic-release/npm`](https://www.npmjs.com/package/@semantic-release/npm)
- [`@semantic-release/github`](https://www.npmjs.com/package/@semantic-release/github)

The configuration of the plugins is opinionated and it includes for configured projects:

- Generating the changelog
- NPM release
- GitHub release
- Update the package version in the source code

### Configuration of the builder

In your `angular.json`/`workspace.json` you can use the builder with:

```json
"release": {
  "builder": "@ng-easy/builders:semantic-release",
  "configurations": {
    "local": {
      "force": true
    }
  }
}
```

Additionally, you can use the following options:

- `dryRun`: defaults to `false`, runs the release process without releasing
- `force`: defaults to `false`, forces the release in a non CI environment, can be used to make a release locally
- `mode`: can be either `independent` or `sync`, defaults to `independent`, choose whether you want to make individual versioning or group all under the same version

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

If using just the Angular CLI, make sure to perform releases according to the order of dependencies.

### How to use `independent` mode

With this mode each releasable library will have its own version according to [semver](https://semver.org/). This is the preferred approach.

[Conventional commits](https://www.conventionalcommits.org/) follow the pattern `<type>[(optional scope)]: <description>`. When the builder is configured in `independent` mode, only the following commits will considered that apply for the individual project:

- Those without scope or scope equal to `*`
- Those where the scope is equal to the project name

Example of `angular.json`/`workspace.json`:

```json
{
  "projects": {
    "library": {
      // Only commits like "feat: new feature", "feat(*): new feature" or "feat(library): new feature" will be considered
      "targets": {
        "build": {
          /* */
        },
        "release": {
          "builder": "@ng-easy/builders:semantic-release"
        }
      }
    }
  }
}
```

### How to use `sync` mode

With this mode each all libraries will have the same version.

Just use these options:

```json
"release": {
  "builder": "@ng-easy/builders:semantic-release",
  "options": {
    "mode": "sync"
  }
}
```

All commits will be considered for a potential version bump. Changelog will still be in each project, only containing the changes that apply to the specific library.

### Bump major version

```shell
git commit -m "feat: :sparkles: bump major version" -m "BREAKING CHANGE New version"
```

### Force a specific version

If you want to force a version bump not following semantic release run:

```shell
git tag {packageName}@{newVersion} # Force a new higher base version
git push --tags
git commit -m "fix({project}): :arrow_up: force version bump" --allow-empty # Force the semantic release process
git push
```

And then do a release.

### Tips for GitHub Actions CI

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
