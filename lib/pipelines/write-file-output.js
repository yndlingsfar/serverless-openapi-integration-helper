const jsYml = require('js-yaml');
const fs = require('fs');

class WriteOutputFile {
    invoke(options, content, serverless) {
        try {
            fs.mkdirSync(options.outputDirectory, { recursive: true })
            fs.writeFileSync(options.outputFullPath, jsYml.dump(content), 'utf8');
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = WriteOutputFile
