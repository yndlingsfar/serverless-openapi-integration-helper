const jsYml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge')

// if a method has request params this step copies the specification to the options method
class AddCorsParams {
    invoke(options, content, serverless) {
        try {
            if (!options.cors) {
                return content;
            }


            Object.entries(content.paths).forEach(([path, pathContent]) => {
                let parameters = {};
                Object.entries(pathContent).forEach(([method, methodContent]) => {
                if (method !== 'options') {
                    if (methodContent.hasOwnProperty('parameters')) {
                        parameters = methodContent.parameters;
                    }
                }
                })
            });

            if (parameters) {
                Object.entries(content.paths).forEach(([path, pathContent]) => {
                    Object.entries(pathContent).forEach(([method, methodContent]) => {
                    if (method === 'options') {
                        let parameterValues = {parameters: parameters};
                        Object.assign(methodContent, merge(methodContent, parameterValues));
                    }
                    })
                });
            }

            return content;
        } catch (e) {
            console.log(e);
        }
        return content
    }
}

module.exports = AddCorsParams
