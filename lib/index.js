const jsYml = require('js-yaml');
const fs = require('fs');
const OptionsResolver = require('./options-resolver');
const AddCorsMethods = require('./pipelines/add-cors-methods')
const AddCorsHeader = require('./pipelines/add-cors-header')
const WriteOutputFile = require('./pipelines/write-file-output')
const AddIntegrations = require('./pipelines/add-integration')
const AddCorsIntegration = require('./pipelines/add-cors-integrations')
const AddCorsResponseParameters = require('./pipelines/add-cors-response-parameters')
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
                    }
                },
            }
        };

        this.hooks = {
            'integration:help': this.generateHelp.bind(this),
            'integration:merge:process': this.processCommand.bind(this),
            'after:package:finalize': this.processPackage.bind(this)
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
                },
                required: ['inputFile', 'mapping'],
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

    process(options) {
        let  content = jsYml.load(fs.readFileSync(options.inputFullPath, 'utf8'))
        const pipelineRunner = new Pipeline(options, content, this.serverless);
        pipelineRunner
            .step(new AddIntegrations())
            .step(new AddCorsMethods())
            .step(new AddCorsHeader())
            .step(new AddCorsIntegration())
            .step(new AddCorsResponseParameters())
            .step(new WriteOutputFile())
            .end()
    }

    processCommand() {
        let  configuration = this.serverless.configurationInput.openApiIntegration
        if (Object.keys(configuration).length === 0) {
            this.serverless.cli.log('Openapi Integration: missing configuration');
        }

        let optionsResolver = new OptionsResolver(configuration);
        const options = optionsResolver.resolve(this.options.stage);

        this.process(options);
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
        this.serverless.cli.log("Openapi Integration: successfully created " + options.outputDirectory + options.outputFile);
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

        this.serverless.cli.log(`Openapi Integration: Auto-Generation of: resources.Resources.ApiGatewayRestApi.Properties.Body`);
    }
}
module.exports = MergeIntegrationPlugin;
