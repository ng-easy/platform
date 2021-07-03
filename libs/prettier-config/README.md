# @ng-easy/prettier-config

[![npm latest version](https://img.shields.io/npm/v/@ng-easy/prettier-config/latest.svg)](https://www.npmjs.com/package/@ng-easy/prettier-config) [![README](https://img.shields.io/badge/README--green.svg)](/libs/prettier-config/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/libs/prettier-config/CHANGELOG.md)

[Shared Prettier configuration](https://prettier.io/docs/en/configuration.html#sharing-configurations) for Angular projects.

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
