"use strict";

module.exports = {
    rules: {
        "jquery-var-name": require("./lib/rules/jquery-var-name"),
        "check-closure-globals": require("./lib/rules/check-closure-globals")
    },
    rulesConfig: {
        "jquery-var-name": [1],
        "check-closure-globals": [1]
    }
};
