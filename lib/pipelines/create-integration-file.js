const jsYml = require('js-yaml');
const fs = require('fs');
const integrationBuilder = require('../integrations/builder')

class CreateIntegrationFile {
    invoke(options, content, serverless) {
        try {
            fs.mkdirSync(options.outputDirectory, { recursive: true })
            Object.entries(content.paths).forEach(([path, pathContent]) => {
                let integrationMethods = {[path]: {}};
                Object.entries(pathContent).forEach(([method, methodContent]) => {
                    if (!methodContent.hasOwnProperty('x-amazon-apigateway-integration')) {
                        integrationMethods[path][method] = integrationBuilder.build(
                            options.type,
                            method,
                            methodContent.parameters,
                            methodContent.responses
                        );
                    }
                });

                if (Object.keys(integrationMethods[path]).length > 0) {
                    const filename = options.outputDirectory + '/' + Date.now() + Math.floor(Math.random() * 1000) + '.yml';
                    fs.writeFileSync(filename, jsYml.dump({'paths': integrationMethods}), 'utf8');
                    serverless.cli.log(
                        `Generated integration ${path} in file ${filename}`,
                        'OpenApi Integration Plugin',
                        {color: 'green'}
                    );
                } else {
                    serverless.cli.log(
                        `All methods in path ${path} contains x-amazon-apigateway-integration blocks. Nothing to do`,
                        'OpenApi Integration Plugin',
                        {color: 'orange'}
                    );
                }

            });

        } catch (e) {
            console.log(e);
        }

        return content;
    }
}

module.exports = CreateIntegrationFile
