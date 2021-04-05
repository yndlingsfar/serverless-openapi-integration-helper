'use strict';

const expect = require('chai').expect;
const Serverless = require('serverless/lib/Serverless');
const CLI = require('serverless/lib/classes/CLI');
const MergeIntegrationPlugin = require('../../lib/index');

describe('#index', () => {
    let serverless;
    let serverlessStepFunctions;

    context('Commands', () => {
        it("registers commands", () => {
            let plugin = new MergeIntegrationPlugin();
            expect(plugin.commands.integration.commands.merge.lifecycleEvents).to.include(
                "readDefinition"
            );
            expect(plugin.commands.integration.commands.merge.lifecycleEvents).to.include(
                "writeDefiniton"
            );
        });

        it("registers hooks", () => {
            let plugin = new MergeIntegrationPlugin();
            expect(plugin.hooks["integration:merge:readDefinition"]).to.be.a("function");
            expect(plugin.hooks["integration:merge:writeDefiniton"]).to.be.a("function");
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

        it("should require the definition argument", () => {

        })

        it("should require the integration argument", () => {

        })

        it("should defaults the output argument", () => {

        })
    });
})

