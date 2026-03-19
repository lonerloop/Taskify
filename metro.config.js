const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force @hugeicons/core-free-icons to use CJS build to avoid ESM resolution issues in Metro
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@hugeicons/core-free-icons': path.resolve(__dirname, 'node_modules/@hugeicons/core-free-icons/dist/cjs/index.js'),
};

module.exports = withNativeWind(config, { input: './global.css' });

