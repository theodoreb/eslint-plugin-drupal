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

eslintTester.addRuleTest("lib/rules/jquery-var-name", {

    // Examples of code that should not trigger the rule
    valid: [
        "var $element = $('#element');",
        "var $element = $('#element').find('.test').once('eslint');",
        "var $element = $('#element').find('.test').once('eslint').attr('href', '//');"
    ],

    // Examples of code that should trigger the rule
    invalid: [
        {
            code: "var element = $('#element');",
            errors: [
                { message: "Variable name doesn't have '$' prefix.", type: "AssignmentExpression" }
            ]
        },
        {
            code: "var $element = $('#element').attr('href');",
            errors: [
                { message: "jQuery method returns a string.", type: "AssignmentExpression" }
            ]
        }
    ]
});
