const mergeYaml = require('merge-yaml');
const jsYml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class YamlParser{
    constructor(definition) {
        this.files = [
            definition
        ];
    }

    getFilesFromDirectory(directory) {
        const filenames = fs.readdirSync(directory);
        return filenames.filter(function (file) {
            return path.extname(file).toLowerCase() === '.yml' || path.extname(file).toLowerCase() === '.yaml';
        });
    }

    write(content, outputFile, outputDirectory) {
        fs.mkdirSync(outputDirectory, { recursive: true })
        fs.writeFileSync(outputDirectory + outputFile, jsYml.dump(content), 'utf8');
    }

    parse(filePath) {
        let files = this.files;
        if (fs.lstatSync(filePath).isFile()) {
            files.push(filePath);
        }

        if (fs.lstatSync(filePath).isDirectory()) {
            const filteredFileNames = this.getFilesFromDirectory(filePath);
            filteredFileNames.forEach(function (file, index) {
                const fullFilePath = [filePath, file].join('/');
                files.push(fullFilePath);
            });
        }

        return this.merge(files)
    }

    merge(files) {
        return mergeYaml(files);
    }

    getFiles() {
        return this.files;
    }
}

module.exports = YamlParser;
