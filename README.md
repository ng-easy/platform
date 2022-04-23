# @ng-easy

[![CI](https://github.com/ng-easy/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ng-easy/platform/actions/workflows/ci.yml) ![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg) ![renovate](https://img.shields.io/badge/maintaied%20with-renovate-blue?logo=renovatebot)

<img src="https://raw.githubusercontent.com/ng-easy/platform/main/assets/icon-512x512.png" width="128">

## Packages

Monorepo with many tools and packages for [Nx](https://nx.dev/) and [Angular](https://angular.io/) projects:

### Tools

| Project                    | Package                                                                          | Version                                                                                                                                           | Downloads                                                                                                                      | Links                                                                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Builders**               | [`@ng-easy/builders`](https://npmjs.com/package/@ng-easy/builders)               | [![npm latest version](https://img.shields.io/npm/v/@ng-easy/builders/latest.svg)](https://www.npmjs.com/package/@ng-easy/builders)               | [![Downloads](https://img.shields.io/npm/dm/@ng-easy/builders)](https://www.npmjs.com/package/@ng-easy/builders)               | [![README](https://img.shields.io/badge/README--green.svg)](/libs/builders/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/libs/builders/CHANGELOG.md)               |
| **ESLint Shared Config**   | [`@ng-easy/eslint-config`](https://npmjs.com/package/@ng-easy/eslint-config)     | [![npm latest version](https://img.shields.io/npm/v/@ng-easy/eslint-config/latest.svg)](https://www.npmjs.com/package/@ng-easy/eslint-config)     | [![Downloads](https://img.shields.io/npm/dm/@ng-easy/eslint-config)](https://www.npmjs.com/package/@ng-easy/eslint-config)     | [![README](https://img.shields.io/badge/README--green.svg)](/libs/eslint-config/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/libs/eslint-config/CHANGELOG.md)     |
| **Prettier Shared Config** | [`@ng-easy/prettier-config`](https://npmjs.com/package/@ng-easy/prettier-config) | [![npm latest version](https://img.shields.io/npm/v/@ng-easy/prettier-config/latest.svg)](https://www.npmjs.com/package/@ng-easy/prettier-config) | [![Downloads](https://img.shields.io/npm/dm/@ng-easy/prettier-config)](https://www.npmjs.com/package/@ng-easy/prettier-config) | [![README](https://img.shields.io/badge/README--green.svg)](/libs/prettier-config/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/libs/prettier-config/CHANGELOG.md) |
| **Image Optimizer**        | [`@ng-easy/image-optimizer`](https://npmjs.com/package/@ng-easy/image-optimizer) | [![npm latest version](https://img.shields.io/npm/v/@ng-easy/image-optimizer/latest.svg)](https://www.npmjs.com/package/@ng-easy/image-optimizer) | [![Downloads](https://img.shields.io/npm/dm/@ng-easy/image-optimizer)](https://www.npmjs.com/package/@ng-easy/image-optimizer) | [![README](https://img.shields.io/badge/README--green.svg)](/libs/image-optimizer/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/libs/image-optimizer/CHANGELOG.md) |

## Development

Create new `node` library:

```shell
nx g lib --buildable --publishable --importPath=@ng-easy/... --name=...
```
