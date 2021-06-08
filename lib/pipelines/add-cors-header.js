const jsYml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge')

class AddCorsHeader {
    invoke(options, content, serverless) {
        try {
            if (!options.cors) {
                return content;
            }
            const cors = this.readTemplate(serverless)
            Object.entries(content.paths).forEach(([path, pathContent]) => {
                Object.entries(pathContent).forEach(([method, methodContent]) => {
                    Object.entries(methodContent.responses).forEach(([response, responseContent]) => {
                        if (!responseContent.hasOwnProperty('headers')) {
                            let headers = {headers: cors};
                            Object.assign(responseContent, merge(responseContent, headers));
                        } else {
                            Object.assign(responseContent.headers, merge(responseContent.headers, cors));
                        }
                    });
                });
            });

            return content;
        } catch (e) {
            console.log(e);
        }
        return content
    }

    readTemplate(serverless) {
        const templatePath = path.resolve(process.cwd(), 'openapi-integration/headers.yml')
        try {
            if (fs.existsSync(templatePath)) {
                serverless.cli.log(
                    `Process custom CORS header template`,
                    'OpenApi Integration Plugin',
                    );
                return jsYml.load(fs.readFileSync(templatePath))
            }
        } catch (err) {
            console.error(err)
        }

        serverless.cli.log(
            `Process default CORS header template`,
            'OpenApi Integration Plugin'
        );
        return jsYml.load(fs.readFileSync(__dirname + '/../../templates/cors/headers.yml'));
    }
}

module.exports = AddCorsHeader
