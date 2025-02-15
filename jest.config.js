module.exports = {
    testEnvironment: "jsdom",
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    },
    transformIgnorePatterns: ["/node_modules/(?!axios)"],
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy", // ✅ Mock CSS
      "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/__mocks__/fileMock.js", // ✅ Mock Images
      "date-fns-tz": "<rootDir>/__mocks__/date-fns-tz.js"
    }
  };
  