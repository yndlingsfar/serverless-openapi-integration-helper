class Pipeline{
    constructor(options, content, serverless) {
        this.options = options;
        this.content = content;
        this.serverless = serverless
    }

    step(pipelineStep) {
       let mergedContent = pipelineStep.invoke(this.options, this.content, this.serverless);
       return new this.constructor(this.options, mergedContent, this.serverless)
    }

    end() {
        this.serverless.cli.log(`Openapi Integration: successfully created ${this.options.outputFullPath}`);
    }
}

module.exports = Pipeline
