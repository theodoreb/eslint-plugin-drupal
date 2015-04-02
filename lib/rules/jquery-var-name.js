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

    /**
     * Get exact callee name from expression
     * @param {ASTNode} node CallExpression or NewExpression node
     * @returns {string} name
     */
    function extractNameFromExpression(node) {

        var name = "",
            property;

        if (node.type === "MemberExpression") {
            property = node.property;

            if (property.type === "Literal" && (typeof property.value === "string")) {
                name = property.value;
            } else if (property.type === "Identifier" && !node.computed) {
                name = property.name;
            }
        } else {
            name = node.name;
        }
        return name;
    }

    /**
     * Extract name from an object key
     * @param {object} key
     * @returns {string} name of key
     */
    function extractNameFromKey(key) {
        var name = "";
        if (key.type === "Identifier") {
            name = key.name;
        } else if (key.type === "Literal") {
            name = key.value;
        }
        return name;
    }

    /**
     * Verify that the expression returns a jQuery object.
     * @param {array} parentInfos parent declaration node and assigned node.
     * @returns {boolean} true if return is a jQuery oject.
     */
    function checkjQueryObjectReturn(parentInfos) {
        var node = parentInfos[1];

        var noChainingAnyArguments = [
            "extend", "parseJSON", "contains", "globalEval", "proxy",
            "serializeArray", "get", "toArray", "trim", "type"
        ];
        var noChainingOneArgument = [
            "attr", "prop", "css", "data",
            "has", "is", "hasClass", "triggerHandler",
            "fieldValue"
        ];
        var noChainingNoArguments = [
            "size", "scrollTop", "scrollLeft", "index", "html", "height",
            "width", "offset", "position", "queue", "text", "val", "now",
            "noop", "outerHeight", "outerWidth", "innerHeight", "innerWidth"
        ];

        // Get last method called and check it can be chained.
        var lastExpressionMember = extractNameFromExpression(node.callee || node);
        if (!lastExpressionMember) {
            return false;
        }
        // Functions starting with "is" return booleans.
        if (lastExpressionMember.indexOf("is") === 0) {
            return false;
        }
        // If there are no arguments it's a property, not a jQuery object.
        if (!node.arguments) {
            return false;
        }
        if (lastExpressionMember in String.prototype) {
            return false;
        }
        // Functions that will never return a jQuery Object.
        if (noChainingAnyArguments.indexOf(lastExpressionMember) !== -1) {
            return false;
        }
        // Functions that will return a value when called with 1 argument.
        if (noChainingOneArgument.indexOf(lastExpressionMember) !== -1) {
            if (node.arguments.length === 1) {
                // Those methods can be passed an object and will return a
                // jQuery object.
                if (["css", "prop", "attr"].indexOf(lastExpressionMember) !== -1) {
                    return node.arguments[0].type !== "Literal";
                }
                return false;
            }
        }
        // Functions that will return a value when called with no arguments.
        if (noChainingNoArguments.indexOf(lastExpressionMember) !== -1) {
            if (node.arguments.length === 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get the closest assignment involving a jQuery identifier.
     * @param parents list of node parents
     * @returns {boolean|*[]} returns false or an array of nodes
     */
    function getDeclarationParent(parents) {
        var parent = false;
        var assignee = false;
        var types = {
            "Property": "value",
            "VariableDeclarator": "init",
            "AssignmentExpression": "right"
        };
        var bailout = [
            "NewExpression"
        ];

        parents.reverse().some(function (node) {
            var nodeType = node.type;
            if (bailout.indexOf(nodeType) !== -1) {
                return true;
            }
            if (nodeType in types) {
                parent = node;
                assignee = node[types[nodeType]];
                return true;
            }
            return false;
        });

        return parent && [parent, assignee];
    }

    /**
     * Check whether an identifier is a jQuery object.
     * @todo add param in config to change name.
     * @param {ASTNode} node
     * @returns {boolean}
     */
    function isjQuery(node) {
        return !!node.name && ["jQuery", "$"].indexOf(node.name) !== -1;
    }

    /**
     * Extract name of the variable the jQuery object is assigned to.
     * @param {ASTNode} parent
     * @returns {string} name of variable/property
     */
    function getAssigneeName(parent) {
        var name = "";

        switch (parent.type) {
            case "VariableDeclarator":
                name = parent.id.name;
                break;

            case "AssignmentExpression":
                name = extractNameFromExpression(parent.left);
                break;

            case "Property":
                name = extractNameFromKey(parent.key);
                break;
        }

        return name;
    }

    /**
     * Check presence of jQuery prefix.
     * @todo add param in config to change name.
     * @param name
     * @returns {*|boolean}
     */
    function checkjQueryPrefix(name) {
        return name && name[0] === "$";
    }

    return {
        "Identifier": function(node) {
            // jQuery is doing something.
            if (!isjQuery(node)) { return; }

            var parentInfos = getDeclarationParent(context.getAncestors(node));
            if (!parentInfos) { return; }

            if (!checkjQueryObjectReturn(parentInfos)) { return; }

            var asigneeName = getAssigneeName(parentInfos[0]);
            if (!checkjQueryPrefix(asigneeName)) {
                context.report(parentInfos[0], "Identifier '{{name}}' contains a jQuery object and should be prefixed with '$'.", {name: asigneeName});
            }
        }
    };
};

