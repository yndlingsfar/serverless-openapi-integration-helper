'use strict';

const builder = require('../../../lib/integrations/builder');
const expect = require('chai').expect;

describe('HTTP_PROXY Generator', () => {
    it('should generate post http_proxy integration with empty parameters', () => {
        let integration = builder.build(
            'http_proxy',
            'POST',
            null,
            {
                '201':
                    {
                        description: 'user created'
                    }
            }
         );

        expect(integration).to.have.property('x-amazon-apigateway-integration');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('type').equal('http_proxy');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('httpMethod').equal('POST');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('uri').equal('https://www.example.com');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('passthroughBehavior').equal('when_no_match');
        expect(integration['x-amazon-apigateway-integration'].responses).to.have.property('201');
    })
    it('should generate get http_proxy integration with parameters', () => {
        let integration = builder.build(
            'http_proxy',
            'GET',
            [{
                name: 'email',
                in: 'query',
                description: 'some_description',
                required: true,
                style: 'simple',
                explode: false,
                schema: {type: 'string'}
            }],
            {
                '200':
                    {
                        description: 'user found',
                        headers: {
                            'X-API-Header': {
                                style: 'simple',
                                explode: false,
                                schema: {
                                    type: 'string'
                                }
                            }
                        }
                    }
            }
        );

        expect(integration).to.have.property('x-amazon-apigateway-integration');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('type').equal('http_proxy');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('httpMethod').equal('GET');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('uri').equal('https://www.example.com');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('passthroughBehavior').equal('when_no_match');
        expect(integration['x-amazon-apigateway-integration'].responses).to.have.property('200');
        expect(integration['x-amazon-apigateway-integration'].responses['200']).to.not.have.property('headers');
        expect(integration['x-amazon-apigateway-integration'].requestParameters).to.have.property('integration.request.query.email');
    })
});

describe('HTTP Generator', () => {
    it('should generate post http integration with empty parameters', () => {
        let integration = builder.build(
            'http',
            'POST',
            null,
            {
                '201':
                    {
                        description: 'user created'
                    }
            }
        );

        expect(integration).to.have.property('x-amazon-apigateway-integration');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('type').equal('http');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('httpMethod').equal('POST');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('uri').equal('https://www.example.com');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('passthroughBehavior').equal('when_no_match');
        expect(integration['x-amazon-apigateway-integration'].responses).to.have.property('201');
    })
    it('should generate get http integration with query parameters', () => {
        let integration = builder.build(
            'http',
            'GET',
            [{
                name: 'email',
                in: 'query',
                description: 'some_description',
                required: true,
                style: 'simple',
                explode: false,
                schema: {type: 'string'}
            }],
            {
                '200':
                    {
                        description: 'user found',
                        headers: {
                            'X-API-Header': {
                                style: 'simple',
                                explode: false,
                                schema: {
                                    type: 'string'
                                }
                            }
                        }
                    }
            }
        );

        expect(integration).to.have.property('x-amazon-apigateway-integration');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('type').equal('http');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('httpMethod').equal('GET');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('uri').equal('https://www.example.com');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('passthroughBehavior').equal('when_no_match');
        expect(integration['x-amazon-apigateway-integration'].responses).to.have.property('200');
        expect(integration['x-amazon-apigateway-integration'].responses['200']).to.have.property('headers');
        expect(integration['x-amazon-apigateway-integration'].requestParameters).to.have.property('integration.request.query.email');
    })
});

describe('AWS_PROXY Generator', () => {
    it('should generate post aws_proxy integration with empty parameters', () => {
        let integration = builder.build(
            'aws_proxy',
            'POST',
            null,
            {
                '201':
                    {
                        description: 'user created'
                    }
            }
        );

        expect(integration).to.have.property('x-amazon-apigateway-integration');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('type').equal('aws_proxy');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('httpMethod').equal('POST');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('uri').equal('arn:aws:lambda:us-west-2:123456789012:function:my-function');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('passthroughBehavior').equal('when_no_match');
        expect(integration['x-amazon-apigateway-integration'].responses).to.have.property('201');
    })
    it('should generate get aws_proxy integration with query parameters', () => {
        let integration = builder.build(
            'aws_proxy',
            'GET',
            [{
                name: 'email',
                in: 'query',
                description: 'some_description',
                required: true,
                style: 'simple',
                explode: false,
                schema: {type: 'string'}
            }],
            {
                '200':
                    {
                        description: 'user found',
                        headers: {
                            'X-API-Header': {
                                style: 'simple',
                                explode: false,
                                schema: {
                                    type: 'string'
                                }
                            }
                        }
                    }
            }
        );

        expect(integration).to.have.property('x-amazon-apigateway-integration');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('type').equal('aws_proxy');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('httpMethod').equal('POST');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('uri').equal('arn:aws:lambda:us-west-2:123456789012:function:my-function');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('passthroughBehavior').equal('when_no_match');
        expect(integration['x-amazon-apigateway-integration'].responses).to.have.property('200');
        expect(integration['x-amazon-apigateway-integration'].responses['200']).to.not.have.property('headers');
        expect(integration['x-amazon-apigateway-integration'].requestParameters).to.have.property('integration.request.query.email');
    })
});

describe('AWS Generator', () => {
    it('should generate post aws integration with empty parameters', () => {
        let integration = builder.build(
            'aws',
            'POST',
            null,
            {
                '201':
                    {
                        description: 'user created'
                    }
            }
        );

        expect(integration).to.have.property('x-amazon-apigateway-integration');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('type').equal('aws');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('httpMethod').equal('POST');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('uri').equal('arn:aws:lambda:us-west-2:123456789012:function:my-function');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('passthroughBehavior').equal('when_no_match');
        expect(integration['x-amazon-apigateway-integration'].responses).to.have.property('201');
    })
    it('should generate get aws integration with query parameters', () => {
        let integration = builder.build(
            'aws',
            'GET',
            [{
                name: 'email',
                in: 'query',
                description: 'some_description',
                required: true,
                style: 'simple',
                explode: false,
                schema: {type: 'string'}
            }],
            {
                '200':
                    {
                        description: 'user found',
                        headers: {
                            'X-API-Header': {
                                style: 'simple',
                                explode: false,
                                schema: {
                                    type: 'string'
                                }
                            }
                        }
                    }
            }
        );

        expect(integration).to.have.property('x-amazon-apigateway-integration');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('type').equal('aws');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('httpMethod').equal('POST');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('uri').equal('arn:aws:lambda:us-west-2:123456789012:function:my-function');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('passthroughBehavior').equal('when_no_match');
        expect(integration['x-amazon-apigateway-integration'].responses).to.have.property('200');
        expect(integration['x-amazon-apigateway-integration'].responses['200']).to.have.property('headers');
        expect(integration['x-amazon-apigateway-integration'].requestParameters).to.have.property('integration.request.query.email');
    })
});

describe('MOCK Generator', () => {
    it('should generate post mock integration with empty parameters', () => {
        let integration = builder.build(
            'mock',
            'POST',
            null,
            {
                '201':
                    {
                        description: 'user created'
                    }
            }
        );

        expect(integration).to.have.property('x-amazon-apigateway-integration');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('type').equal('mock');
        expect(integration['x-amazon-apigateway-integration']).not.to.have.property('httpMethod');
        expect(integration['x-amazon-apigateway-integration']).not.to.have.property('uri');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('passthroughBehavior').equal('when_no_match');
        expect(integration['x-amazon-apigateway-integration'].responses).to.have.property('201');
    })
    it('should generate get mock integration with query parameters', () => {
        let integration = builder.build(
            'mock',
            'GET',
            [{
                name: 'email',
                in: 'query',
                description: 'some_description',
                required: true,
                style: 'simple',
                explode: false,
                schema: {type: 'string'}
            }],
            {
                '200':
                    {
                        description: 'user found',
                        headers: {
                            'X-API-Header': {
                                style: 'simple',
                                explode: false,
                                schema: {
                                    type: 'string'
                                }
                            }
                        }
                    }
            }
        );

        expect(integration).to.have.property('x-amazon-apigateway-integration');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('type').equal('mock');
        expect(integration['x-amazon-apigateway-integration']).not.to.have.property('httpMethod');
        expect(integration['x-amazon-apigateway-integration']).not.to.have.property('uri');
        expect(integration['x-amazon-apigateway-integration']).to.have.property('passthroughBehavior').equal('when_no_match');
        expect(integration['x-amazon-apigateway-integration'].responses).to.have.property('200');
        expect(integration['x-amazon-apigateway-integration'].responses['200']).to.have.property('headers');
        expect(integration['x-amazon-apigateway-integration'].requestTemplates).to.be.property('application/json').equal('{"statusCode": 200}');
    })
});
