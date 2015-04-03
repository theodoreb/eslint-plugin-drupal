/**
 * @fileoverview Ensure jquery variables are prefixed with '$'
 * @author Théodore Biadala
 * @copyright 2015 Théodore Biadala. All rights reserved.
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    var globals = ["$"];
    var fileGlobals = {};

    function isClosure(node) {
        return node.type === "CallExpression" && node.callee.type === "FunctionExpression";
    }

    return {
        "Program": function(node) {
            var scope = context.getScope();
            var seenit = false;
            scope.variables.forEach(function (variable) {
                // hack: Don't do anything before we see XPathResult
                // Only get global from our config.
                if (!seenit) { seenit = variable.name === "XPathResult"; return; }
                if (variable.scope.type === "global") {
                    globals.push(variable.name);
                }
            });
        },
        "Identifier": function(node) {
            if (globals.indexOf(node.name) !== -1) {
                var outerClosure = false;
                var ancestors = context.getAncestors(node);
                // Don't analyse the outer closure itself.
                if (ancestors.length <= 3) { return; }

                ancestors.some(function (parent) {
                    if (isClosure(parent)) {
                        outerClosure = parent;
                        return true;
                    }
                    return false;
                });

                if (outerClosure.callee) {
                    var params = outerClosure.callee.params.map(function (param) { return param.name; });
                    var filename = context.getFilename();
                    if (params.indexOf(node.name) === -1 && fileGlobals[filename].indexOf(node.name) === -1) {
                        fileGlobals[filename].push(node.name);
                        context.report(outerClosure, "Global '{{name}}' was used but not declared as parameter of file closure", {name: node.name});
                    }
                }
            }
        },
        "CallExpression": function(node) {
            if (isClosure(node) && context.getAncestors().length <= 3) {
                var closureArguments = node.arguments;
                var closureParams = node.callee.params;
                fileGlobals[context.getFilename()] = [];
                if (closureArguments.length !== closureParams.length) {
                    context.report(node, "Mismatch in the number of arguments and paramters in the closure");
                }
            }
        }
    };
};

