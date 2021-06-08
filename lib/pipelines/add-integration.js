const jsYml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge')

class AddIntegrations {
    invoke(options, content, serverless) {
        try {

            if (!options.integrationPath) {
                return content;
            }

            if (fs.lstatSync(options.integrationPath).isFile()) {
                let integrationFile = jsYml.load(fs.readFileSync(options.integrationPath, 'utf8'));
                serverless.cli.log(
                    `Merge x-amazon-apigateway-integration integration: ${options.integrationPath}`,
                    'OpenApi Integration Plugin'
                );
                return merge(content, integrationFile)
            }

            if (fs.lstatSync(options.integrationPath).isDirectory()) {
                const filteredFileNames = this.getFilesFromDirectory(options.integrationPath);
                filteredFileNames.forEach(function (file, index) {
                    const fullFilePath = [options.integrationPath, file].join('/');
                    let integrationFile  = jsYml.load(fs.readFileSync(fullFilePath, 'utf8'));
                    content = merge(content, integrationFile)
                    serverless.cli.log(
                        `Merge x-amazon-apigateway-integration integration: ${fullFilePath}`,
                        'OpenApi Integration Plugin'
                    );
                });

                return content
            }
        } catch (e) {
            console.log(e);
        }
    }

    getFilesFromDirectory(directory) {
        const filenames = fs.readdirSync(directory);
        return filenames.filter(function (file) {
            return path.extname(file).toLowerCase() === '.yml' || path.extname(file).toLowerCase() === '.yaml';
        });
    }
}

module.exports = AddIntegrations
