# @ng-easy/builders

[![npm latest version](https://img.shields.io/npm/v/@ng-easy/builders/latest.svg)](https://www.npmjs.com/package/@ng-easy/builders) [![README](https://img.shields.io/badge/README--green.svg)](/libs/builders/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/libs/builders/CHANGELOG.md)

Builders for Angular projects.

## image-optimizer

This builder is a wrapper of [`@ng-easy/image-optimizer`](https://github.com/ng-easy/platform/tree/main/libs/image-optimizer) designed to generate build time optimized images from an assets folder.

A suggested configuration would be to place original images in a separate folder and make the output path the standard assets folder of the project and include them in the repo. This way it will integrate nicely with Angular build process without need for build orchestration.

### Configuration of the builder

In your `angular.json` you can use the builder with:

```json
"release": {
  "builder": "@ng-easy/builders:image-optimizer",
  "options": {
    "assets": ["src/assets/original-images"],
    "outputPath": "src/assets/optimized-images"
  }
}
```

- `assets`: folders containing source images
- `outputPath`: where optimized images will be saved

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

In your `angular.json` you can use the builder with:

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
on: workflow_dispatch # Manual trigger so that you can batch changes

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
```
