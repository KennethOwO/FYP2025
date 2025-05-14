import type { Config } from "@jest/types";

const jsdom = require("jest-environment-jsdom");

const config: Config.InitialOptions = {
  preset: "ts-jest",
  collectCoverage: true,
  coveragePathIgnorePatterns: ["node_modules", "coverage"],
  collectCoverageFrom: [
    "./src/**/*.{ts,tsx,js,jsx}", // Include all TypeScript/TSX and JavaScript/JSX files under src
    "!./src/tests/**", // Exclude test files
    "!**/node_modules/**", // Exclude files in node_modules,
    "!*.json",
    "!*.{ts,tsx,js,jsx}", // Avoid double inclusion of the root files
    "!./src/services/**",
    "!./src/constants/**",
    "!./src/store/**",
    "!./src/i18n/**",
    "./src/containers/**/components/*.{tsx,ts,js,jsx}", // Include component files
  ],
  testResultsProcessor: "jest-junit",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest", // Transform both TypeScript and JavaScript files
  },
  transformIgnorePatterns: [
    "node_modules/(?!(some-library)/)",
    "^.+\\.module\\.(css)$",
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "identity-obj-proxy",
    "\\.(css)$": "identity-obj-proxy",
    "^@root/(.*)$": "<rootDir>/src/$1",
  },
  coverageReporters: ["lcov", "clover", "html"],
  coverageDirectory: "<rootDir>/coverage",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: [
    "**/__tests__/**/*.js", // Look for JavaScript test files
    "**/?(*.)+(spec|test).[tj]s?(x)", // Look for both TypeScript and JavaScript test files
  ],
};

export default config;
