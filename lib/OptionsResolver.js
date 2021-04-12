class OptionsResolver {


    constructor(options) {
        this.options = options;
    }

    _isPackage() {
        if (!this.options.hasOwnProperty('package')) {
            return true;
        }

        return this.options.package && this.options.package === true;
    }

    _inputFile() {
        if (!this.options.inputFile) {
            throw new TypeError('Missing argument inputFile');
        }

        return this.options.inputFile;
    }

    _inputDirectory() {
        if (!this.options.inputDirectory) {
            return './';
        }

        return this.options.inputDirectory;
    }

    _outputFile() {
        if (!this.options.outputFile) {
            return 'api.yml';
        }

        return this.options.outputFile;
    }

    _outputDirectory() {
        if (!this.options.outputDirectory) {
            return 'openapi-integration/';
        }

        return this.options.outputDirectory.replace(/\/?$/, '/');
    }

    _mappingPath(stage) {
        if (!this.options.mapping) {
            throw new TypeError('Missing argument mapping');
        }

        let path = null;
        this.options.mapping.forEach(function (mapping) {
            if (mapping.stage === stage) {
                path = mapping.path;
            }
        });

        if (path === null) {
            throw new TypeError(`Missing integration mapping for the ${stage} stage`);
        }

        return path;
    }

    _validate() {
        let allowedConfigurations = ['package', 'inputFile', 'inputDirectory', 'outputDirectory', 'outputFile', 'mapping'];
        Object.entries(this.options).forEach(([key, value]) => {
            if (!allowedConfigurations.includes(key)){
                throw new Error(`unrecognized option ${key}. 
            Allowed options are package, inputFile, inputDirectory, outputDirectory, outputFile, mapping`);
            }
        })
    }

    resolve(stage = "dev") {
        this._validate();
        return {
            package: this._isPackage(),
            inputFile: this._inputFile(),
            inputDirectory: this._inputDirectory(),
            outputFile: this._outputFile(),
            outputDirectory: this._outputDirectory(),
            integrationPath: this._mappingPath(stage)
        }
    }
}

module.exports = OptionsResolver;
