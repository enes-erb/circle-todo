const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for React Native 0.79.x typeof parsing issues
config.resolver.sourceExts.push('mjs');

// Enable strict mode for better ES6 module support
config.transformer.unstable_allowRequireContext = true;

module.exports = config;