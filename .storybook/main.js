const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: [],
  addons: ['@storybook/addon-docs', '@storybook/addon-essentials', '@storybook/addon-a11y'],
  webpackFinal: (config) => {
    config.resolve.plugins = [...(config.resolve.plugins || []), new TsconfigPathsPlugin({ extensions: config.resolve.extensions })];
    return config;
  },
};
