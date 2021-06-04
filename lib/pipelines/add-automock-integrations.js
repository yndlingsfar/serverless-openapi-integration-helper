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
                            serverless.cli.log(`ERROR: AUTO-MOCK is unable to generate a mock for ${key}:${method} because at least one specified 2xx response code is required`)
                        } else {
                            serverless.cli.log(`Openapi Integration: add AUTO-MOCK for ${key}:${method} with response code ${takenResponse}`)
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
        // const templatePath = path.resolve(process.cwd(), 'openapi-integration/auto-mock.yml')
        // try {
        //     if (fs.existsSync(templatePath)) {
        //         serverless.cli.log(`Openapi Integration: add custom AUTO-MOCK template`);
        //         return jsYml.load(fs.readFileSync(templatePath))
        //     }
        // } catch (err) {
        //     console.error(err)
        // }

        // serverless.cli.log(`Openapi Integration: add default AUTO-MOCK template for all methods without x-amazon-apigateway-integration`);
        return jsYml.load(fs.readFileSync(__dirname + '/../../templates/mock/auto-mock.yml'));
    }
}

module.exports = AddAutoMockIntegration
