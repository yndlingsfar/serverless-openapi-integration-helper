'use strict';

const responseBuilder = require('../../../lib/integrations/response-builder');
const expect = require('chai').expect;

describe('Response', () => {
    it('should map single response parameter', () => {
        let responseMappings = responseBuilder.build({
            '201':
                {
                    description: 'user created',
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
        });

        expect(responseMappings).to.have.property('201');
        expect(responseMappings['201']).to.have.property('headers');
        expect(responseMappings['201'].headers).to.have.property('method.response.header.X-API-Header').with.equal('integration.response.header.X-API-Header');
    })
    it('should map multiple response parameter', () => {
        let responseMappings = responseBuilder.build({
            '201':
                {
                    description: 'user created',
                    headers: {
                        'X-API-Header': {
                            style: 'simple',
                            explode: false,
                            schema: {
                                type: 'string'
                            }
                        },
                        'CUSTOM-API-Header': {
                            style: 'simple',
                            explode: false,
                            schema: {
                                type: 'string'
                            }
                        }
                    }
                }
        });

        expect(responseMappings).to.have.property('201');
        expect(responseMappings['201']).to.have.property('headers');
        expect(responseMappings['201'].headers).to.have.property('method.response.header.X-API-Header').with.equal('integration.response.header.X-API-Header');
        expect(responseMappings['201'].headers).to.have.property('method.response.header.CUSTOM-API-Header').with.equal('integration.response.header.CUSTOM-API-Header');
    })
});
