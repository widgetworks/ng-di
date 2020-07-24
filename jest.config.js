module.exports = {
    testEnvironment: 'jsdom',
    "moduleFileExtensions": [
      "js",
    ],
    "moduleNameMapper": {
        "^ng-di": "<rootDir>/lib/index.js",
    },
    "testPathIgnorePatterns": [
        "node_modules",
    ],
    "testMatch": [
        // "**/src/**/unit/**/*.spec.(js|jsx|ts|tsx)"
        "<rootDir>/test/**/*Spec.(js|jsx|ts|tsx)"
    ],
};

/*
"jest": {
    "moduleFileExtensions": [
      "js",
      "ts"
    ],
    "testURL": "http://localhost/",
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    }
  }
*/
