module.exports = {
  root: true,
  env: { es2021: true, browser: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react-native/all",
    "prettier",
    "expo",
    "@react-native",
  ],
  plugins: ["react", "react-native", "unused-imports", "import", "simple-import-sort"],
  parserOptions: { ecmaVersion: 2021, sourceType: "module", ecmaFeatures: { jsx: true } },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "unused-imports/no-unused-imports": "error",
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          // 1. React e React Native sempre primeiro
          ["^react$", "^react-native$"],
          // 2. React Native components
          ["^react-native/"],
          // 3. Expo packages (incluindo expo-router)
          ["^expo", "^@expo", "^expo-router"],
          // 4. Outras bibliotecas externas
          ["^@?\\w"],
          // 5. Imports internos (context, hooks, components)
          ["^(@|../context|../hooks|./context|./hooks)"],
          // 6. Componentes locais
          ["^@/components", "^../components", "^./components"],
          // 7. Imports relativos
          ["^\\.\\.", "^\\."],
          // 8. Assets sempre por último
          ["^.+\\.(png|jpg|jpeg|gif|svg)$"],
        ],
      },
    ],
    "simple-import-sort/exports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
  },
  settings: { react: { version: "detect" } },
};
1;
