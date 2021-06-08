const parameterBuilder = require('../integrations/param-builder');
const responseBuilder = require('../integrations/response-builder');

exports.integration = function (type, httpMethod, params, responses) {
    let integration = {
        'x-amazon-apigateway-integration' : {
            httpMethod: httpMethod.toUpperCase(),
            uri: 'https://www.example.com',
            type: type.toLowerCase(),
            passthroughBehavior: "when_no_match"
        }
    };

    const resolvedParameters = parameterBuilder.build(params);
    const resolvedResponses = responseBuilder.build(responses, type);

    if (resolvedParameters) {
        integration.requestParameters = resolvedParameters;
    }

    if (resolvedResponses) {
        integration.responses = resolvedResponses;
    }

    return integration;
};

