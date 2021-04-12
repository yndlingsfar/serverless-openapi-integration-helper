'use strict';

const expect = require('chai').expect;
const Serverless = require('serverless/lib/Serverless');
const CLI = require('serverless/lib/classes/CLI');
const MergeIntegrationPlugin = require('../../lib/index');

describe('#index', () => {
    let serverless;

    context('Commands', () => {
        it("registers commands", () => {
            let plugin = new MergeIntegrationPlugin();
            expect(plugin.commands.integration.commands.merge.lifecycleEvents).to.include(
                "process"
            );
        });

        it("registers hooks", () => {
            let plugin = new MergeIntegrationPlugin();
            expect(plugin.hooks["integration:merge:process"]).to.be.a("function");
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

