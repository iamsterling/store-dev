import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default [
  ...nextVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/packages/*/src/**", "**/apps/*/**"],
              message:
                "Import workspace packages through their public exports, never relative internals.",
            },
          ],
        },
      ],
    },
  },
  { ignores: [".next/**", "node_modules/**", "src/database.types.ts"] },
];
