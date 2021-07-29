# @ng-easy/prettier-config

[![CI](https://github.com/ng-easy/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ng-easy/platform/actions/workflows/ci.yml) [![npm latest version](https://img.shields.io/npm/v/@ng-easy/prettier-config/latest.svg)](https://www.npmjs.com/package/@ng-easy/prettier-config) [![README](https://img.shields.io/badge/README--green.svg)](/libs/prettier-config/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/libs/prettier-config/CHANGELOG.md) ![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)

[Shared Prettier configuration](https://prettier.io/docs/en/configuration.html#sharing-configurations) for [Nx](https://nx.dev/) and [Angular](https://angular.io/) projects.

## Installation

```shell
npm install -D prettier @ng-easy/prettier-config
```

## Usage

In `.prettierrc.json`:

```json
"@ng-easy/prettier-config"
```

In `.prettierrc.js`:

```js
module.exports = {
  ...require('@ng-easy/prettier-config'),
};
```
