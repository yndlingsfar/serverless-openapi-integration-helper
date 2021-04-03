const mergeYaml = require('merge-yaml');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class MergeIntegrationPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {
      "integration merge": {
        usage: 'Merges swagger api definition with integration in yml files',
        lifecycleEvents: [
          'readDefinition',
          'writeDefiniton'
        ],
        options: {
          definition: {
            usage:
                'Specifiy the file containing the api specification ' +
                '(e.g. "--definition \'api.yml\'" or "-d \'api.yml\'")',
            required: true,
            shortcut: 'd',
          },
          integration: {
            usage:
                'Specifiy a file or directory containing the aws integration. If directory provided ' +
                'all yml files inside will be processed ' +
                '(e.g. "--integration \'components/customer.yml\'" or "-i \'components\'")',
            required: true,
            shortcut: 'i',
          },
          output: {
            usage:
                'Specifiy the output filename ' +
                '(e.g. "--output \'output.yml\'" or "-o \'output.yml\'")',
            required: false,
            shortcut: 'o',
            default: 'output.yml'
          },
        },
      },
    };

    this.hooks = {
      'merge:readDefinition': this.readDefinition.bind(this),
      'merge:writeDefiniton': this.writeDefiniton.bind(this)
    };
  }

  getFilesFromDirectory(directory) {
    const filenames = fs.readdirSync(directory);
    return filenames.filter(function(file) {
      return path.extname(file).toLowerCase() === '.yml' || path.extname(file).toLowerCase() === '.yaml';
    });
  }

  readDefinition() {
    let serverless = this.serverless;
    let options = this.options;

    serverless.cli.log('read api definition from: ' + options.definition);
    let files = [
      options.definition
    ];

    if (fs.lstatSync(options.integration).isFile()) {
      files.push(options.integration);
      serverless.cli.log('merged integration from: ' + options.integration);
    }

    if(fs.lstatSync(options.integration).isDirectory()) {
      const filteredFileNames = this.getFilesFromDirectory(options.integration);
      filteredFileNames.forEach(function (file, index) {
        const fullFilePath = [options.integration, file].join('/');
          files.push(fullFilePath);
          serverless.cli.log('merged integration from: ' + fullFilePath);
        });
    }

    this.apiDefinition = mergeYaml(files);
  }

  writeDefiniton() {
    let yamlStr = yaml.dump(this.apiDefinition);
    fs.writeFileSync('api.yml', yamlStr, 'utf8');
    this.serverless.cli.log("successfully merged api definitions to " + this.options.output);
  }
}

module.exports = MergeIntegrationPlugin;
