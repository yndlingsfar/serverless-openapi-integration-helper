const mergeYaml = require('merge-yaml');

class YamlParser{
    constructor() {
    }

    merge(files) {
        return mergeYaml(files);
    }
}

module.exports = YamlParser;
