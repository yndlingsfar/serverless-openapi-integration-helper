const jsYml = require('js-yaml');
const fs = require('fs');
const httpProxyIntegration = require('../integrations/http-proxy')

class CreateIntegrationFile {
    invoke(options, content, serverless) {
        try {
            fs.mkdirSync(options.outputDirectory, { recursive: true })
            Object.entries(content.paths).forEach(([path, pathContent]) => {
                Object.entries(pathContent).forEach(([method, methodContent]) => {
                    if (!methodContent.hasOwnProperty('x-amazon-apigateway-integration')) {
                        let integration = {
                            [path]: httpProxyIntegration.integration(options.type, method, methodContent.parameters, methodContent.responses)
                        }
                        const filename = options.outputDirectory + '/' + Date.now() + '-' + Math.floor(Math.random() * 1000) + '.yml';
                        fs.writeFileSync(filename, jsYml.dump(integration), 'utf8');
                        serverless.cli.log(
                            `Generated integration ${path} in file ${filename}`,
                            'OpenApi Integration Plugin'
                            );
                    }
                });
            });

        } catch (e) {
            console.log(e);
        }

        return content;
    }
}

module.exports = CreateIntegrationFile
