import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow any types
      "@typescript-eslint/no-explicit-any": "off",
      
      // Allow unused variables
      "@typescript-eslint/no-unused-vars": "off",
      
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "off",
      
      // Allow img elements instead of Next.js Image
      "@next/next/no-img-element": "off",
      
      // Allow missing dependencies in useEffect
      "react-hooks/exhaustive-deps": "off",
      
      // Allow console statements
      "no-console": "off",
      
      // Allow empty functions
      "@typescript-eslint/no-empty-function": "off",
      
      // Allow non-null assertions
      "@typescript-eslint/no-non-null-assertion": "off",
      
      // Allow require statements
      "@typescript-eslint/no-var-requires": "off",
      
      // Allow any function types
      "@typescript-eslint/ban-types": "off",
      
      // Allow prefer const
      "prefer-const": "off",
      
      // Allow no-undef
      "no-undef": "off"
    }
  }
];

export default eslintConfig;
