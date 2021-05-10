'use strict';

const expect = require('chai').expect;
const Serverless = require('serverless/lib/Serverless');
const CLI = require('serverless/lib/classes/CLI');
const MergeIntegrationPlugin = require('../../lib/index');

describe('#index', () => {
    context('Commands', () => {
        let serverless;
        let plugin;

        beforeEach(() => {
            serverless = new Serverless();
            serverless.service.service = 'serverless-openapi-integration-helper';
            const options = {
                stage: 'dev',
                region: 'eu-central-1',
            };
            serverless.configSchemaHandler = {
                defineTopLevelProperty: (propertyName, propertySchema) => {},
            };
            serverless.cli = new CLI(serverless);
            plugin = new MergeIntegrationPlugin(serverless, options);
        });

        it("registers commands", () => {
            expect(plugin.commands.integration.commands.merge.lifecycleEvents).to.include(
                "process"
            );
        });

        it("registers hooks", () => {
            expect(plugin.hooks["integration:help"]).to.be.a("function");
            expect(plugin.hooks["integration:merge:process"]).to.be.a("function");
            expect(plugin.hooks["before:aws:package:finalize:mergeCustomProviderResources"]).to.be.a("function");
        });

        it("should generate help for default command", () => {
            var plugin = new MergeIntegrationPlugin(
                {
                    cli: {
                        generateCommandsHelp: command => {
                            expect(command).to.deep.equal(["integration"]);
                        }
                    }
                },
                {}
            );

            expect(plugin.hooks["integration:help"]()).to.be.fulfilled;
        });

    });

})

