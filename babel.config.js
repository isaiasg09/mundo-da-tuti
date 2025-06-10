module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["@babel/preset-react", "babel-preset-expo"],
    plugins: [
      "@babel/plugin-syntax-jsx",
      // "expo-router/babel",
      "@babel/plugin-proposal-export-namespace-from",
      "react-native-reanimated/plugin",
    ],
  };
};
