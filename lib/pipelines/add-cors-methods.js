const jsYml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge')

class AddCorsMethods {
    invoke(options, content, serverless) {
        try {
            if (!options.cors) {
                return content;
            }

            const cors = this.readTemplate(serverless);
            Object.entries(content.paths).forEach(([key, value]) => {
                if (!value.hasOwnProperty('options')) {
                    let path = {options: cors};
                    Object.assign(value, merge(value, path));

                } else {
                    Object.assign(value, cors);
                }
            });

            return content;
        } catch (e) {
            console.log(e);
        }
        return content
    }

    readTemplate(serverless) {
        const templatePath = path.resolve(process.cwd(), 'openapi-integration/path.yml')
        try {
            if (fs.existsSync(templatePath)) {
                serverless.cli.log(
                    `Process custom CORS path template`,
                    'OpenApi Integration Plugin'
                );
                return jsYml.load(fs.readFileSync(templatePath))
            }
        } catch (err) {
            console.error(err)
        }

        serverless.cli.log(
            `Process default CORS path template`,
            'OpenApi Integration Plugin'
        );
        return jsYml.load(fs.readFileSync(__dirname + '/../../templates/cors/path.yml'));
    }
}

module.exports = AddCorsMethods
