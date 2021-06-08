const parameterBuilder = require('../integrations/param-builder');
const responseBuilder = require('../integrations/response-builder');

exports.build = function (type, httpMethod, params, responses, uri='https://www.example.com') {

    const isProxy = function (type) {
        return !(type === 'aws' || type === 'http' || type === 'mock' || type === 'mock');
    };

    const isHttp = function (type) {
        return (type === 'http' || type === 'http_proxy');
    };

    const isMock = function (type) {
        return (type === 'mock');
    };

    let integration = {
        'x-amazon-apigateway-integration' : {
            type: type.toLowerCase(),
            passthroughBehavior: "when_no_match"
        }
    };

    let resolvedParameters, resolvedResponses;
    if (params) {
        resolvedParameters = parameterBuilder.build(params);
    }

    if (responses) {
        resolvedResponses = responseBuilder.build(responses, isProxy(type));
    }

    if (!isMock(type)) {
        integration['x-amazon-apigateway-integration'].httpMethod= isHttp(type) ? httpMethod.toUpperCase() : 'POST';
        integration['x-amazon-apigateway-integration'].uri = isHttp(type) ? `${uri}` : 'arn:aws:lambda:us-west-2:123456789012:function:my-function';

        if (resolvedParameters) {
            integration['x-amazon-apigateway-integration'].requestParameters = resolvedParameters;
        }
    } else {
        integration['x-amazon-apigateway-integration'].requestTemplates = {
            'application/json': "{\"statusCode\": 200}"
        };
    }


    if (resolvedResponses) {
        integration['x-amazon-apigateway-integration'].responses = resolvedResponses;
    }

    return integration;
};

