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
     * Verify that the expression returns a jQuery object.
     *
     * @param {ASTNode} node Litteral or CallExpression.
     * @returns {boolean} true if return is a jQuery oject.
     */
    function jQueryObjectCheck(node) {
        var checkChaining = ["attr", "prop", "css", "data",
            "outerHeight", "outerWidth", "innerHeight", "innerWidth",
            "has", "is", "hasClass", "triggerHandler",
            "serializeArray", "get", "toArray"
        ];
        var specialChaining = [
            "size", "scrollTop", "scrollLeft", "index", "html", "height",
            "width", "offset", "position", "queue", "text", "val"
        ];
        var source = context.getSource(node);

        if (/^jQuery\(|^\$\(/.test(source)) {
            // Get last method called and check it can be chained.
            var lastExpressionMember = extractNameFromExpression(node.callee || node);
            // Depending on function signature return value changes for them.

            if (checkChaining.indexOf(lastExpressionMember) !== -1) {
                // Methods return values, not jQuery objects.
                if (node.arguments.length <= 1) {
                    return false;
                }
            }
            if (specialChaining.indexOf(lastExpressionMember) !== -1) {
                if (node.arguments.length === 0) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Run the rule.
     *
     * @param {ASTNode} node original node
     */
    function checkVariable(node) {
        // Other types can't give a valid jQuery object.
        var validTypes = ["CallExpression", "Identifier", "MemberExpression", "ThisExpression"];
        var name;
        var assignedNode;

        if (node.type === "VariableDeclarator") {
            name = node.id.name;
            assignedNode = node.init;
        } else if (node.type === "AssignmentExpression" &&
            node.right && validTypes.indexOf(node.right.type) !== -1) {
            name = extractNameFromExpression(node.left);
            assignedNode = node.right;
        }

        if ((name && assignedNode) && jQueryObjectCheck(assignedNode) && name[0] !== "$") {
            context.report(node, "Identifier '{{name}}' contains a jQuery object and should be prefixed with '$'.", { name: name });
        }
    }

    return {
        "VariableDeclarator": checkVariable,
        "AssignmentExpression": checkVariable
    };
};

