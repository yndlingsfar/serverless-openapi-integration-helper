'use strict';

const paramBuilder = require('../../../lib/integrations/param-builder');
const expect = require('chai').expect;

describe('ParameterBuilder', () => {
    it('should map path parameters', () => {
        let parameterMappings = paramBuilder.build([{
            name: 'email',
            in: 'path',
            description: 'some_description',
            required: true,
            style: 'simple',
            explode: false,
            schema: {type: 'string'}
        }]);
        expect(parameterMappings).to.have.property('integration.request.path.email').with.equal("method.request.path.email");
    })
    it('should map query parameters', () => {
        let parameterMappings = paramBuilder.build([{
            name: 'email',
            in: 'query',
            description: 'some_description',
            required: true,
            style: 'simple',
            explode: false,
            schema: {type: 'string'}
        }]);
        expect(parameterMappings).to.have.property('integration.request.querystring.email').with.equal("method.request.querystring.email");
    })
    it('should map header parameters', () => {
        let parameterMappings = paramBuilder.build([{
            name: 'email',
            in: 'header',
            description: 'some_description',
            required: true,
            style: 'simple',
            explode: false,
            schema: {type: 'string'}
        }]);
        expect(parameterMappings).to.have.property('integration.request.header.email').with.equal("method.request.header.email");
    })
    it('should map multiple parameters', () => {
        let parameterMappings = paramBuilder.build(
            [
                {
                    name: 'email',
                    in: 'path',
                    description: 'some_description',
                    required: true,
                    style: 'simple',
                    explode: false,
                    schema: {type: 'string'}
                },
                {
                    name: 'name',
                    in: 'query',
                    description: 'some_description',
                    required: true,
                    style: 'simple',
                    explode: false,
                    schema: {type: 'string'}
                }
            ]
        );
        expect(parameterMappings).to.have.property('integration.request.path.email').with.equal("method.request.path.email");
        expect(parameterMappings).to.have.property('integration.request.querystring.name').with.equal("method.request.querystring.name");
    })

    it('should ignore cookie parameter', () => {
        let parameterMappings = paramBuilder.build(
            [
                {
                    name: 'token',
                    in: 'cookie',
                    description: 'some_description',
                    required: true,
                    style: 'simple',
                    explode: false,
                    schema: {type: 'string'}
                }
            ]
        );
        expect(parameterMappings).to.not.have.property('integration.request.cookie.token');
    })
});
