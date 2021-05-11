# @ng-easy/builders

Builders for Angular projects.

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

If you want to force a version bump not following semantic release run:

```shell
git tag {packageName}@{newVersion} # Force a new higher base version
git push --tags
git commit -m "fix({project}): force version bump" # Force the semantic release process
```

And then do a release.
