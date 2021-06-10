const jsYml = require('js-yaml');
const integrationBuilder = require('../integrations/builder');
const merge = require('lodash.merge');

class CreateProxy {
    invoke(options, content, serverless) {
        try {
            if (!options.proxy) {
               return content;
            }

            Object.entries(content.paths).forEach(([path, pathContent]) => {
                let integrationMethods = {[path]: {}};
                Object.entries(pathContent).forEach(([method, methodContent]) => {
                    if (!methodContent.hasOwnProperty('x-amazon-apigateway-integration')) {

                        let resolvedPath = path;
                        if (options.proxy.pattern) {
                            resolvedPath = resolvedPath.match(
                                options.proxy.pattern
                            )
                        }

                        integrationMethods[path][method] = integrationBuilder.build(
                            options.proxy.type,
                            method,
                            methodContent.parameters,
                            methodContent.responses,
                            `${options.proxy.baseUrl}${resolvedPath}`
                        );
                    }
                });

                if (Object.keys(integrationMethods[path]).length > 0) {
                    content = merge(content, {'paths': integrationMethods})
                    serverless.cli.log(
                        `[BETA] Generating Proxy for ${path}`,
                        'OpenApi Integration Plugin',
                        {color: 'green'}
                    );
                }
            });

        } catch (e) {
            console.log(e);
        }

        return content;
    }
}

module.exports = CreateProxy
