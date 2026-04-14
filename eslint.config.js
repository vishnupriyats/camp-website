const security = require("eslint-plugin-security");

module.exports = [
    security.configs.recommended,
    {
        plugins: {
            security
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                require: "readonly",
                module: "readonly",
                process: "readonly",
                __dirname: "readonly",
                console: "readonly"
            }
        }
    }
];