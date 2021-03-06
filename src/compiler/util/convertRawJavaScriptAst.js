module.exports = function convertRawJavaScriptAst(ast, builder) {
    function convert(node) {
        if (Array.isArray(node)) {
            let nodes = node;
            for (let i = 0; i < nodes.length; i++) {
                var converted = convert(nodes[i]);
                if (converted == null) {
                    return null;
                }
                nodes[i] = converted;
            }
            return nodes;
        }

        switch (node.type) {
            case "ArrayExpression": {
                let elements = convert(node.elements);
                if (!elements) {
                    return null;
                }
                return builder.arrayExpression(elements);
            }
            case "AssignmentExpression": {
                let left = convert(node.left);
                if (!left) {
                    return null;
                }

                let right = convert(node.right);
                if (!right) {
                    return null;
                }

                return builder.assignment(left, right, node.operator);
            }
            case "BinaryExpression": {
                let left = convert(node.left);
                if (!left) {
                    return null;
                }

                let right = convert(node.right);
                if (!right) {
                    return null;
                }

                return builder.binaryExpression(left, node.operator, right);
            }
            case "BlockStatement": {
                let body = convert(node.body);
                if (!body) {
                    return null;
                }

                return body;
            }
            case "CallExpression": {
                let callee = convert(node.callee);

                if (!callee) {
                    return null;
                }

                let args = convert(node.arguments);
                if (!args) {
                    return null;
                }

                return builder.functionCall(callee, args);
            }
            case "ConditionalExpression": {
                let test = convert(node.test);

                if (!test) {
                    return null;
                }

                let consequent = convert(node.consequent);

                if (!consequent) {
                    return null;
                }

                let alternate = convert(node.alternate);

                if (!alternate) {
                    return null;
                }

                return builder.conditionalExpression(
                    test,
                    consequent,
                    alternate
                );
            }
            case "ExpressionStatement": {
                return convert(node.expression);
            }
            case "FunctionDeclaration":
            case "FunctionExpression": {
                let name = null;

                if (node.id) {
                    name = convert(node.id);
                    if (name == null) {
                        return null;
                    }
                }

                let params = convert(node.params);
                if (!params) {
                    return null;
                }

                let body = convert(node.body);
                if (!body) {
                    return null;
                }

                return builder.functionDeclaration(name, params, body);
            }
            case "Identifier": {
                return builder.identifier(node.name);
            }
            case "Literal": {
                let literalValue;

                if (node.regex) {
                    literalValue = new RegExp(
                        node.regex.pattern,
                        node.regex.flags
                    );
                } else {
                    literalValue = node.value;
                }

                return builder.literal(literalValue);
            }
            case "TaggedTemplateExpression": {
                if (node.tag.name === "$nonstandard") {
                    const quasi = convert(node.quasi);
                    if (quasi) {
                        quasi.nonstandard = true;
                        return quasi;
                    }
                }
                return null;
            }
            case "TemplateLiteral": {
                const quasis = node.quasis.map(q => q.value.cooked);
                const expressions = convert(node.expressions);
                if (expressions) {
                    return builder.templateLiteral(quasis, expressions);
                }
                return null;
            }
            case "LogicalExpression": {
                let left = convert(node.left);
                if (!left) {
                    return null;
                }

                let right = convert(node.right);
                if (!right) {
                    return null;
                }

                return builder.logicalExpression(left, node.operator, right);
            }
            case "MemberExpression": {
                let object = convert(node.object);
                if (!object) {
                    return null;
                }

                let property = convert(node.property);
                if (!property) {
                    return null;
                }

                return builder.memberExpression(
                    object,
                    property,
                    node.computed
                );
            }
            case "NewExpression": {
                let callee = convert(node.callee);

                if (!callee) {
                    return null;
                }

                let args = convert(node.arguments);
                if (!args) {
                    return null;
                }

                return builder.newExpression(callee, args);
            }
            case "Program": {
                if (node.body && node.body.length === 1) {
                    return convert(node.body[0]);
                }

                let container = builder.containerNode();
                for (let child of node.body) {
                    let convertedChild = convert(child);
                    if (convertedChild) {
                        container.appendChild(convertedChild);
                    } else {
                        return null;
                    }
                }
                return container;
            }
            case "ObjectExpression": {
                let properties = convert(node.properties);
                if (!properties) {
                    return null;
                }
                return builder.objectExpression(properties);
            }
            case "Property": {
                let computed = node.computed === true;

                let key = convert(node.key);
                if (!key) {
                    return null;
                }

                if (node.kind === "get" || node.kind === "set") {
                    return null;
                }

                if (!computed && key.type === "Identifier") {
                    // Favor using a Literal AST node to represent
                    // the key instead of an Identifier
                    key = builder.literal(key.name);
                }

                let value = convert(node.value);
                if (!value) {
                    return null;
                }

                return builder.property(key, value, computed);
            }
            case "ReturnStatement": {
                var argument = node.argument;

                if (argument != null) {
                    argument = convert(node.argument);
                    if (!argument) {
                        return null;
                    }
                }

                return builder.returnStatement(argument);
            }
            case "ThisExpression": {
                return builder.thisExpression();
            }
            case "UnaryExpression": {
                let argument = convert(node.argument);
                if (!argument) {
                    return null;
                }

                return builder.unaryExpression(
                    argument,
                    node.operator,
                    node.prefix
                );
            }
            case "UpdateExpression": {
                let argument = convert(node.argument);
                if (!argument) {
                    return null;
                }

                return builder.updateExpression(
                    argument,
                    node.operator,
                    node.prefix
                );
            }
            case "VariableDeclarator": {
                var id = convert(node.id);
                if (!id) {
                    return null;
                }

                var init;

                if (node.init) {
                    init = convert(node.init);
                    if (!init) {
                        return null;
                    }
                }

                return builder.variableDeclarator(id, init);
            }
            case "VariableDeclaration": {
                var kind = node.kind;

                var declarations = convert(node.declarations);

                if (!declarations) {
                    return null;
                }
                return builder.vars(declarations, kind);
            }
            case "IfStatement": {
                const ifNodeTest = convert(node.test);
                const ifNodeBody = convert(node.consequent);

                if (!ifNodeTest || !ifNodeBody) {
                    return null;
                }

                const ifNode = builder.ifStatement(ifNodeTest, ifNodeBody);
                let alternate = node.alternate;

                if (!alternate) {
                    return ifNode;
                }

                const container = builder.containerNode();
                container.appendChild(ifNode);

                do {
                    if (alternate.consequent) {
                        const elseIfNodeTest = convert(alternate.test);
                        const elseIfNodeBody = convert(alternate.consequent);

                        if (!elseIfNodeTest || !elseIfNodeBody) {
                            return null;
                        }

                        container.appendChild(
                            builder.elseIfStatement(
                                elseIfNodeTest,
                                elseIfNodeBody
                            )
                        );
                    } else {
                        const elseNodeBody = convert(alternate);

                        if (!elseNodeBody) {
                            return null;
                        }

                        container.appendChild(
                            builder.elseStatement(elseNodeBody)
                        );
                    }

                    alternate = alternate.alternate;
                } while (alternate);

                return container;
            }
            case "ForStatement": {
                const forNodeInit = convert(node.init);
                const forNodeTest = convert(node.test);
                const forNodeUpdate = convert(node.update);
                const forNodeBody = convert(node.body);

                if (
                    !forNodeInit ||
                    !forNodeTest ||
                    !forNodeUpdate ||
                    !forNodeBody
                ) {
                    return null;
                }

                return builder.forStatement(
                    forNodeInit,
                    forNodeTest,
                    forNodeUpdate,
                    forNodeBody
                );
            }
            case "WhileStatement": {
                const whileNodeTest = convert(node.test);
                const whileNodeBody = convert(node.body);

                if (!whileNodeTest || !whileNodeBody) {
                    return null;
                }

                return builder.whileStatement(whileNodeTest, whileNodeBody);
            }
            default:
                return null;
        }
    }

    return convert(ast);
};
