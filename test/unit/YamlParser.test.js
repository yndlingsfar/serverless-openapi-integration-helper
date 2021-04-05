'use strict';

const YamlParser = require('../../lib/YamlParser');
const expect = require('chai').expect;
describe('merge', function () {
    it('should merge the yml files.', function () {
        let parser = new YamlParser();
        let result = parser.merge([
            __dirname + '/../fixtures/oas3.yml',
            __dirname + '/../fixtures/mock.yml'
        ]);
        expect(result.paths['/api/v1/user'].post).has.property('x-amazon-apigateway-integration');
        expect(result.paths['/api/v1/user'].post['x-amazon-apigateway-integration']).has.property('httpMethod');
        expect(result.paths['/api/v1/user'].post['x-amazon-apigateway-integration']).has.property('type');
        expect(result.paths['/api/v1/user'].post['x-amazon-apigateway-integration']).has.property('passthroughBehavior');
        expect(result.paths['/api/v1/user'].post['x-amazon-apigateway-integration']).has.property('requestTemplates');
        expect(result.paths['/api/v1/user'].post['x-amazon-apigateway-integration']).has.property('responses');
    })
});
