const jsYml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge')

class AddValidation {
    invoke(options, content, serverless) {
        try {
            if (!options.validation) {
                return content;
            }

            const validators = this.readTemplate(serverless);
            if (!content.hasOwnProperty('x-amazon-apigateway-request-validators')) {
                content = merge(content, validators);
            }

            return content
        } catch (e) {
            console.log(e);
        }
    }

    readTemplate(serverless) {
        const templatePath = path.resolve(process.cwd(), 'openapi-integration/request-validator.yml')
        try {
            if (fs.existsSync(templatePath)) {
                serverless.cli.log(
                    `Process custom VALIDATION template`,
                    'OpenApi Integration Plugin'
                );
                return jsYml.load(fs.readFileSync(templatePath))
            }
        } catch (err) {
            console.error(err)
        }

        serverless.cli.log(
            `Process default VALIDATION template`,
            'OpenApi Integration Plugin'
        );
        return jsYml.load(fs.readFileSync(__dirname + '/../../templates/validator/request-validator.yml'));
    }
}

module.exports = AddValidation
