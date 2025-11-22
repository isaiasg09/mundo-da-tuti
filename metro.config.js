// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Configure resolver alias for @ symbol
config.resolver.alias = {
  "@": path.resolve(__dirname, "./"),
};

module.exports = config;
