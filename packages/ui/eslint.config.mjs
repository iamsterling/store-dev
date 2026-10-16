import config from "@repo/config/eslint";

const uiConfig = [
  ...config,
  // This is a framework-independent component library, not a Next routes directory.
  { rules: { "@next/next/no-html-link-for-pages": "off" } },
];

export default uiConfig;
