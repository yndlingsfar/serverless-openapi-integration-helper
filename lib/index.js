const jsYml = require('js-yaml');
const fs = require('fs');
const OptionsResolver = require('./options-resolver');
const AddCorsMethods = require('./pipelines/add-cors-methods')
const AddCorsHeader = require('./pipelines/add-cors-header')
const WriteOutputFile = require('./pipelines/write-file-output')
const AddIntegrations = require('./pipelines/add-integration')
const AddCorsIntegration = require('./pipelines/add-cors-integrations')
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
            'before:package:initialize': this.processPackage.bind(this)
        };

        // relevant since sls v1.78.0
        if (this.serverless.configSchemaHandler) {
            const openApiIntegrationSchema = {
                type: 'object',
                properties: {
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
            .step(new WriteOutputFile())
            .end()

        process.env.OPENAPI_INTEGRATION_FILE = options.outputDirectory + options.outputFile;
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
        // return false;
        // const configuration = this.serverless.config.configuration.openApiIntegration;
        // if (!configuration) {
        //     return;
        // }
        //
        // let optionsResolver = new OptionsResolver(configuration);
        // const options = optionsResolver.resolve(this.options.stage);
        //
        // if (Object.entries(options).length === 0) {
        //     this.serverless.cli.log(`Openapi Integration: No matching configuration available for the ${this.options.stage} stage `);
        //     return;
        // }
        // this.process(options);
        // this.serverless.cli.log("successfully created " + options.outputDirectory + options.outputFile);
    }
}
module.exports = MergeIntegrationPlugin;
