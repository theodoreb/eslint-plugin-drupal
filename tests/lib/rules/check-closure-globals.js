/**
 * @fileoverview Ensure jquery variables are prefixed with $
 * @author Théodore Biadala
 * @copyright 2015 Théodore Biadala. All rights reserved.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var linter = require("eslint").linter,
    ESLintTester = require("eslint-tester");
var eslintTester = new ESLintTester(linter);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

eslintTester.addRuleTest("lib/rules/check-closure-globals", {

    // Examples of code that should not trigger the rule
    valid: [
        "(function ($, Drupal) { $(); Drupal; })(jQuery, Drupal);"
    ],

    // Examples of code that should trigger the rule
    invalid: [
        {
            code: "(function () { $(); Drupal; })();",
            errors: [
                { message: "jQuery and Drupal not declared in outer closure"}
            ]
        }
    ]
});
