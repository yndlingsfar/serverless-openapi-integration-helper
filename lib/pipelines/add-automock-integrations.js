const jsYml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge')

class AddAutoMockIntegration {
    invoke(options, content, serverless) {
        try {
            if (!options.autoMock) {
                return content;
            }

            Object.entries(content.paths).forEach(([key, pathContent]) => {
                Object.entries(pathContent).forEach(([method, methodContent]) => {
                    let mock = this.readTemplate(serverless);
                    const availableMethodResponses = ['200', '201', '202', '203', '204', '205', '206', '207', '208', '226']
                    let takenResponse = null

                    if (!methodContent.hasOwnProperty('x-amazon-apigateway-integration')) {
                        Object.entries(methodContent.responses).forEach(([response, responseContent]) => {
                                if (takenResponse === null && availableMethodResponses.includes(response)) {
                                    takenResponse = response;
                                }
                            }
                        );

                        if (takenResponse === null) {
                            serverless.cli.log(
                                `AUTO-MOCK is unable to generate a mock for ${key}:${method} because at least one specified 2xx response code is required`,
                                'OpenApi Integration Plugin',
                                {color: 'red', bold: true}
                            )
                        } else {
                            serverless.cli.log(
                                `Add AUTO-MOCK for ${key}:${method} with response code ${takenResponse}`,
                                'OpenApi Integration Plugin'
                            )
                        }

                        const variableRegex = new RegExp('STATUS_CODE', 'g')
                        mock = JSON.parse(JSON.stringify(mock).replace(variableRegex, takenResponse));
                        Object.assign(methodContent, merge(methodContent, mock));
                    }
                });
            });

            return content;
        } catch (e) {
            console.log(e);
        }
        return content
    }

    readTemplate(serverless) {
        return jsYml.load(fs.readFileSync(__dirname + '/../../templates/mock/auto-mock.yml'));
    }
}

module.exports = AddAutoMockIntegration
