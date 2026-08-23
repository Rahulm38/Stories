/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.resolve(workspaceRoot, 'packages/core')];
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@core': path.resolve(workspaceRoot, 'packages/core/src'),
};

module.exports = config;
