const config = {
  coverageProvider: "babel",
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    resources: "usable",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  preset: "ts-jest",
  setupFiles: ["jest-canvas-mock"],
  moduleNameMapper: {
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/test_static",
  },
};

module.exports = config;
