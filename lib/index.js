const jsYml = require('js-yaml');
const fs = require('fs');
const OptionsResolver = require('./options-resolver');
const AddCorsMethods = require('./pipelines/add-cors-methods')
const AddCorsParams = require('./pipelines/add-cors-params')
const AddCorsHeader = require('./pipelines/add-cors-header')
const WriteOutputFile = require('./pipelines/write-file-output')
const AddIntegrations = require('./pipelines/add-integration')
const AddCorsIntegration = require('./pipelines/add-cors-integrations')
const AddCorsResponseParameters = require('./pipelines/add-cors-response-parameters')
const AddAutoMockIntegration = require('./pipelines/add-automock-integrations')
const AddValidation = require('./pipelines/add-validation')
const CreateIntegrationFile = require('./pipelines/create-integration-file')
const Pipeline = require('./pipeline')

class MergeIntegrationPlugin {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;
        this.commands = {
            integration: {
                usage: 'AWS Gateway Integration management for Serverless',
                lifecycleEvents: ["help"],
                commands: {
                    merge: {
                        usage: 'Merges swagger api definition with integration in yml files',
                        lifecycleEvents: [
                            'process'
                        ]
                    },
                    create: {
                        usage: 'Creates the required x-amazon-apigateway-integration blocks',
                        lifecycleEvents: [
                            'files'
                        ],
                        options: {
                            output: {
                                usage:
                                    'Specify the output directory '
                                    + '(e.g. "--output \'integration\'" or "-o \'integration\'")',
                                required: true,
                                shortcut: 'o',
                                type: 'string'
                            },
                            type: {
                                usage:
                                    'Specify the type of integration '
                                    + '(e.g. "--type \'http_proxy\'" or "-t \'http_proxy\'")',
                                required: true,
                                shortcut: 't',
                                type: 'string'
                            }
                        },
                    }
                },
            }
        };

        this.hooks = {
            'integration:help': this.generateHelp.bind(this),
            'integration:merge:process': this.processMergeCommand.bind(this),
            'integration:create:files': this.createFilesCommand.bind(this),
            'before:aws:package:finalize:mergeCustomProviderResources': this.processPackage.bind(this)
        };

        // relevant since sls v1.78.0
        if (this.serverless.configSchemaHandler) {
            const openApiIntegrationSchema = {
                type: 'object',
                properties: {
                    package: { type: 'string' },
                    inputFile: { type: 'string' },
                    inputDirectory: { type: 'string' },
                    mapping: { type: 'array' },
                    outputFile: { type: 'string' },
                    outputDirectory: { type: 'string' },
                    cors: { type: 'string' },
                    autoMock: { type: 'string' },
                    validation: { type: 'string' },
                },
                required: ['inputFile'],
            };
            this.serverless.configSchemaHandler.defineTopLevelProperty(
                'openApiIntegration',
                openApiIntegrationSchema,
            );
        }
    }

    generateHelp(command="integration") {
        this.serverless.cli.generateCommandsHelp([command]);
    }

    resolve() {
        let  configuration = this.serverless.configurationInput.openApiIntegration;
        if (Object.keys(configuration).length === 0) {
            this.serverless.cli.log('Openapi Integration: missing configuration');
        }

        let optionsResolver = new OptionsResolver(configuration);
        let configuredOptions = optionsResolver.resolve(this.options.stage);

        if (this.options.output) {
            configuredOptions.outputDirectory = this.options.output;
        }

        if (this.options.type) {
            configuredOptions.type = this.options.type;
        }

        return configuredOptions;
    }

    process(options) {
        let  content = jsYml.load(fs.readFileSync(options.inputFullPath, 'utf8'))
        const pipelineRunner = new Pipeline(options, content, this.serverless);
        pipelineRunner
            .step(new AddIntegrations())
            .step(new AddValidation())
            .step(new AddAutoMockIntegration())
            .step(new AddCorsMethods())
            .step(new AddCorsParams())
            .step(new AddCorsHeader())
            .step(new AddCorsIntegration())
            .step(new AddCorsResponseParameters())
            .step(new WriteOutputFile())
    }

    processMergeCommand() {
        const options = this.resolve();
        this.process(options);
    }

    createFilesCommand() {
        const options = this.resolve();
        let  content = jsYml.load(fs.readFileSync(options.inputFullPath, 'utf8'))
        const pipelineRunner = new Pipeline(options, content, this.serverless);
        pipelineRunner
            .step(new AddIntegrations())
            .step(new CreateIntegrationFile())
    }

    processPackage() {
        const configuration = this.serverless.configurationInput.openApiIntegration;
        if (!configuration) {
            return;
        }

        let optionsResolver = new OptionsResolver(configuration);
        const options = optionsResolver.resolve(this.options.stage);

        if (!options.package) {
            this.serverless.cli.log(`Openapi Integration: PROCESS & DEPLOY HOOK IS DEACTIVATED. Refer to manual for further information `);
            return;
        }

        if (Object.entries(options).length === 0) {
            this.serverless.cli.log(`Openapi Integration: No matching configuration available for the ${this.options.stage} stage `);
            return;
        }
        this.process(options);
        this.addApiAGatewayBody(options.outputFullPath)
    }

    addApiAGatewayBody(generatedApiSpecification) {
        let resources = this.serverless.service.resources.Resources;
        Object.entries(resources).forEach(([resourceName, resource]) => {
            if (resource.Type === 'AWS::ApiGateway::RestApi') {
                if (resource.hasOwnProperty('Properties') && !resource.Properties.hasOwnProperty('Body')) {
                    resource.Properties.Body = {}
                }

                resource.Properties.Body = jsYml.load(fs.readFileSync(generatedApiSpecification))
            }

            this.serverless.service.resources.Resources = resources;
        });
    }
}
module.exports = MergeIntegrationPlugin;
