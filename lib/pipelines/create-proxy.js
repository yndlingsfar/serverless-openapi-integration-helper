const jsYml = require('js-yaml');
const integrationBuilder = require('../integrations/builder');
const merge = require('lodash.merge');

class CreateProxy {
    invoke(options, content, serverless) {
        try {
            if (!options.proxyManager) {
               return content;
            }

            Object.entries(content.paths).forEach(([path, pathContent]) => {
                let integrationMethods = {[path]: {}};
                Object.entries(pathContent).forEach(([method, methodContent]) => {
                    if (!methodContent.hasOwnProperty('x-amazon-apigateway-integration')) {

                        let resolvedPath = path;
                        if (options.proxyManager.ignore) {
                            resolvedPath = resolvedPath.replace(
                                options.proxyManager.ignore,
                                ''
                            )
                        }

                        integrationMethods[path][method] = integrationBuilder.build(
                            options.proxyManager.type,
                            method,
                            methodContent.parameters,
                            methodContent.responses,
                            `${options.proxyManager.baseUrl}${resolvedPath}`
                        );
                    }
                });

                if (Object.keys(integrationMethods[path]).length > 0) {
                    content = merge(content, {'paths': integrationMethods})
                }
            });

        } catch (e) {
            console.log(e);
        }

        return content;
    }
}

module.exports = CreateProxy
