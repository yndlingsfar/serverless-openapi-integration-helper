'use strict';

const OptionsResolver = require('../../lib/options-resolver');
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

    it('should resolve to false if no configuration provided', () => {
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
        expect(optionsResolver.resolve().package).to.be.false;
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

    it('should return resolve path mapping with multiple stages per path', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: ["dev", "prod"],
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

    it('should throw an exception if stage does not match (with disabled auto-mock option)', () => {
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

    it('should do nothing if stage does not match (with enabled auto-mock option)', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            autoMock: true,
            mapping: []
        });

        expect(optionsResolver.resolve().integrationPath).to.be.null;
    });
});

describe('check cors support', function () {
    it('should return the value for the cors option if explicitly enabled', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            cors: true,
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
        expect(optionsResolver.resolve('test').cors).to.be.equal(true);
    });

    it('should return the value for the cors option if explicitly disabled', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            cors: false,
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
        expect(optionsResolver.resolve('test').cors).to.be.equal(false);
    });

    it('should return the default value for the cors option if not set', () => {
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
        expect(optionsResolver.resolve('test').cors).to.be.equal(false);
    });
});

describe('check autoMock support', function () {
    it('should return the value for the autoMock option if explicitly enabled', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            autoMock: true,
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
        expect(optionsResolver.resolve('test').autoMock).to.be.equal(true);
    });

    it('should return the value for the autoMock option if explicitly disabled', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            autoMock: false,
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
        expect(optionsResolver.resolve('test').autoMock).to.be.equal(false);
    });

    it('should return the default value for the autoMock option if not set', () => {
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
        expect(optionsResolver.resolve('test').autoMock).to.be.equal(false);
    });
});

describe('check validation support', function () {
    it('should return the value for the validation option if explicitly enabled', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            validation: true,
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
        expect(optionsResolver.resolve('test').validation).to.be.equal(true);
    });

    it('should return the value for the validation option if explicitly disabled', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            validation: false,
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
        expect(optionsResolver.resolve('test').validation).to.be.equal(false);
    });

    it('should return the default value for the validation option if not set', () => {
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
        expect(optionsResolver.resolve('test').validation).to.be.equal(false);
    });
});

describe('check proxyManager support', function () {
    it('should return the proxy manager configuration for a single stage', () => {
            let optionsResolver = new OptionsResolver({
                package: true,
                validation: true,
                inputFile: 'some_input.yml',
                outputFile: 'some_output.yml',
                mapping: [
                    {
                        stage: "dev",
                        path: "some_path/",
                        proxyManager: {
                            type: 'http_proxy',
                            baseUrl: 'https://www.example.com',
                            pattern: 'somePattern'
                        }
                    }
                ]
            });

            expect(optionsResolver.resolve('dev').proxy).to.have.property('type').equal('http_proxy');
            expect(optionsResolver.resolve('dev').proxy).to.have.property('baseUrl').equal('https://www.example.com');
            expect(optionsResolver.resolve('dev').proxy).to.have.property('pattern').equal('somePattern');
    });

    it('should throw error for unsupported type', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            validation: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            mapping: [
                {
                    stage: "dev",
                    path: "some_path/",
                    proxyManager: {
                        type: 'aws_proxy',
                        baseUrl: 'https://www.example.com',
                        pattern: 'somePattern'
                    }
                }
            ]
        });

        expect(() => optionsResolver.resolve("dev")).to.throw(TypeError);
    });

    it('should not throw error if stage has no proxy manager defined', () => {
        let optionsResolver = new OptionsResolver({
            package: true,
            validation: true,
            inputFile: 'some_input.yml',
            outputFile: 'some_output.yml',
            autoMock: true,
            mapping: [
                {
                    stage: ["dev", "prod"],
                    path: "some_path/",
                    proxyManager: {
                        type: 'aws_proxy',
                        baseUrl: 'https://www.example.com',
                        pattern: 'somePattern'
                    }
                }
            ]
        });

        expect(() => optionsResolver.resolve("test")).to.not.throw(TypeError);
    });

});
