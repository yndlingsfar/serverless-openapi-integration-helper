const jsYml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge')

class AddCorsResponseParameters {
    invoke(options, content, serverless) {
        try {
            if (!options.cors) {
                return content;
            }

            const cors = this.readTemplate(serverless);

            Object.entries(content.paths).forEach(([key, pathContent]) => {
                Object.entries(pathContent).forEach(([method, methodContent]) => {
                    if ((methodContent.hasOwnProperty('x-amazon-apigateway-integration'))) {
                        if (!methodContent['x-amazon-apigateway-integration'].responses) {
                            // The integration omitted a 'responses' dictionary - generate one
                            methodContent['x-amazon-apigateway-integration'].responses =
                                Object.keys(methodContent.responses).reduce((responses, statusCode) => {
                                    return Object.assign(responses, {[statusCode]: {statusCode}});
                                }, {});
                        }
                        Object.entries(methodContent['x-amazon-apigateway-integration'].responses).forEach(([responses, responseContent]) => {
                            if (!responseContent.hasOwnProperty('responseParameters')) {
                                let params = {responseParameters: cors};
                                Object.assign(responseContent, merge(responseContent, params));
                            } else {
                                Object.assign(responseContent.responseParameters, merge(responseContent.responseParameters, cors));
                            }
                        });
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
        const templatePath = path.resolve(process.cwd(), 'openapi-integration/response-parameters.yml')
        try {
            if (fs.existsSync(templatePath)) {
                serverless.cli.log(
                    `Process custom CORS response-parameters template`,
                    'OpenApi Integration Plugin'
                );
                return jsYml.load(fs.readFileSync(templatePath))
            }
        } catch (err) {
            console.error(err)
        }

        serverless.cli.log(
            `Process default CORS response-parameters template`,
            'OpenApi Integration Plugin'
        );
        return jsYml.load(fs.readFileSync(__dirname + '/../../templates/cors/response-parameters.yml'));
    }
}

module.exports = AddCorsResponseParameters
