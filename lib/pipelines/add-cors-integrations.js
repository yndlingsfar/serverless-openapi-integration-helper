const jsYml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge')

class AddCorsIntegrations {
    invoke(options, content, serverless) {
        try {
            if (!options.cors) {
                return content;
            }

            const cors = this.readTemplate(serverless);
            Object.entries(content.paths).forEach(([key, pathContent]) => {
                Object.entries(pathContent).forEach(([method, methodContent]) => {
                    if ((method.toLowerCase() === 'options') && (!methodContent.hasOwnProperty('x-amazon-apigateway-integration'))) {
                        Object.assign(methodContent, merge(methodContent, cors));
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
        const templatePath = path.resolve(process.cwd(), 'openapi-integration/integration.yml')
        try {
            if (fs.existsSync(templatePath)) {
                serverless.cli.log(`Openapi Integration: add custom CORS integration template`);
                return jsYml.load(fs.readFileSync(templatePath))
            }
        } catch (err) {
            console.error(err)
        }

        serverless.cli.log(`Openapi Integration: add default CORS integration template`);
        return jsYml.load(fs.readFileSync(__dirname + '/../../templates/cors/integration.yml'));
    }
}

module.exports = AddCorsIntegrations
