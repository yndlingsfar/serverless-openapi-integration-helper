'use strict';

const OptionsResolver = require('../../lib/OptionsResolver');
const expect = require('chai').expect;

describe('validate the configuration', () => {
    it('should throw exception on unrecognized option', () => {
        let optionsResolver = new OptionsResolver({
            package: false,
            some_unrecognized_option: true
        });
        expect(optionsResolver.resolve).to.throw(Error);
    })
});

describe('checking the package status', () => {
    it('should resolve to false if explicitly disabled.', () => {
        let optionsResolver = new OptionsResolver({
            package: false,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().package).to.be.false;
    })

    it('should resolve to true if explicitly enabled.', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().package).to.be.true;
    })

    it('should resolve to true if no configuration provided', () => {
        let optionsResolver = new OptionsResolver({
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().package).to.be.true;
    })
});

describe('checking the input', () => {
    it('should return the input file provided in the configuration', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().inputFile).to.be.equal('some_input.yml');
    })

    it('should throw an exception if no input file is provided', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve).to.throw(TypeError);
    });

    it('should return the input directory provided in the configuration', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            inputDirectory: '/path',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().inputDirectory).to.be.equal('/path');
    })

    it('should return a default input directory if not specified in the configuration', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().inputDirectory).to.be.equal('./');
    })
});

describe('checking the output', () => {
    it('should return the output file provided in the configuration', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().outputFile).to.be.equal('some_output.yml');
    })

    it('should return a default if no output file is provided', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().outputFile).to.be.equal('api.yml');
    })

    it('should return the output directory provided in the configuration', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            outputDirectory: '/path/',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().outputDirectory).to.be.equal('/path/');
    })

    it('should add a trailing slash if missing', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            outputDirectory: '/path',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().outputDirectory).to.be.equal('/path/');
    })

    it('should return a default output directory if not specified in the configuration', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().outputDirectory).to.be.equal('openapi-integration/');
    })
});

describe('check integration path mappings', function () {
    it('should return the mapping path for a given stage', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                },
                {
                    stage: "test",
                    path: "some_other_path/"
                }
            ]
        });
        expect(optionsResolver.resolve('test').integrationPath).to.be.equal('some_other_path/');
    });

    it('should return the mapping path for the default stage', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/"
                },
                {
                    stage: "test",
                    path: "some_other_path/"
                }
            ]
        });
        expect(optionsResolver.resolve().integrationPath).to.be.equal('some_path/');
    });

    it('should throw an exception if stage does not match', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "stage",
                    path: "some_path/"
                }
            ]
        });
        expect(() => optionsResolver.resolve("dev")).to.throw(TypeError);
    });
});
