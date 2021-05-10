<p align="center">
  <a href="https://npmjs.com/package/serverless-openapi-integration-helper">
    <img src="https://flat.badgen.net/npm/v/serverless-openapi-integration-helper?icon=npm&label=npm@latest"></a>
<a href="https://www.npmjs.com/package/serverless-openapi-integration-helper">
    <img src="https://flat.badgen.net/npm/dt/serverless-openapi-integration-helper?icon=npm"></a>
  <a href="https://packagephobia.now.sh/result?p=serverless-openapi-integration-helper">
    <img src="https://flat.badgen.net/packagephobia/install/serverless-openapi-integration-helper"></a>
  <a href="https://www.npmjs.com/package/serverless-openapi-integration-helper">
    <img src="https://flat.badgen.net/npm/license/serverless-openapi-integration-helper"></a>
  <br/>
</p>

_Feedback is appreciated! If you have an idea for how this plugin/library can be improved (or even just a complaint/criticism) then please open an issue._

# Serverless Plugin: AWS Api Gateway integration helper

1. [Overview](#overview)
1. [Installation & Setup](#installation--setup)
1. [Plugin configuration](#plugin-configuration)  
1. [Usage](#usage)
1. [Command](#commands)
1. [CORS Generator](#cors-generator)
1. [Configuration Reference](#configuration-reference)
1. [Example](#example)
1. [Approach to a functional test of schema validation](#approach-to-a-functional-test-of-schema-validation)

# Overview 
The plugin provides the functionality to merge [OpenApiSpecification files](https://swagger.io/specification/) (formerly known as swagger) with one or multiple YML files containing the the x-amazon-apigateway extensions.
There are several use-cases to keep both information separated, e.g. it is needed to deploy different api gateway integrations depending on a stage environment.

When dealing with functional tests you do not want to cover your production environment, but only a mocking response.

**The plugin supports YML based OpenApi3 specification files only**

## Features
- deploy stage dependent x-amazon-apigateway integrations
- separate infrastructure (aws) from openapi specification
- use mock integrations for functional testing
- **[NEW]:** auto-generating CORS methods, headers and api gateway mocking response
- **[NEW]:** hook into package & deploy lifeCycle and generate combined openApi files on the fly during deployment
- **[NEW]:** auto-inject generated openApi file into the **resources.Resources.ApiGatewayRestApi.Properties.Body** property

See the **examples** folder for a full working [example](https://github.com/yndlingsfar/serverless-openapi-integration-helper/tree/main/examples)

# Installation & Setup

Run `npm install` in your Serverless project.

`$ npm install --save-dev serverless-openapi-integration-helper`

Add the plugin to your serverless.yml file

```yml
plugins:
  - serverless-openapi-integration-helper
```
# Plugin configuration
You can configure the plugin under the key **openApiIntegration**. See
See [Configuration Reference](#configuration-reference) for a list of available options

The mapping array must be used to configure where the files containing the **x-amazon-apigateway-integration** blocks are located. 

**Each available stage needs its own mapping entry**

```yml
openApiIntegration:
    package: true #New feature! Hook into the package & deploy process
    inputFile: schema.yml
    mapping:
      - path: integrations
        stage: dev
      - path: integrations
        stage: prod
      - path: mocks/customer.yml
        stage: test
```

In the above example all YML files inside the schemas directory will be processed if deploying the dev stage
```shell
serverless deploy --stage=dev
```

To use a different x-amazon-apigateway to perform functional tests (with a mocking response) the file mock/customer.yml is processed if deploying the test stage
```shell
serverless deploy --stage=test
```

# Usage
With an existing OpenApi Specification file you can easily setup a fully working api gateway.

First create the input file containing the [OpenApiSpecification](https://swagger.io/specification/)
```yml
# ./schema.yml
openapi: 3.0.0
info:
  description: User Registration
  version: 1.0.0
  title: UserRegistration
paths:
  /api/v1/user:
    post:
      summary: adds a user
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Customer'
      responses:
        '201':
          description: user created
components:
  schemas:
    Customer:
      type: object
      required:
        - email_address
        - password
      properties:
        email_address:
          type: string
          example: test@example.com
        password:
          type: string
          format: password
          example: someStrongPassword#
```

Then create a file containing a **gateway mock integration**
```yml
# mocks/customer.yml
paths:
  /api/v1/user:
    post:
      x-amazon-apigateway-integration:
        httpMethod: "POST"
        type: "mock"
        passthroughBehavior: "when_no_match"
        requestTemplates:
          application/json: |
            {
              "statusCode" : 204
            }
        responses:
          "2\\d{2}":
            statusCode: "201"
```

**create one more file containing the production integration**

```yml
#integrations/customer.yml
paths:
  /api/v1/user:
    post:
      x-amazon-apigateway-integration:
        httpMethod: "POST"
        uri: ${self:custom.url}
        type: "http"
        passthroughBehavior: "when_no_match"
        responses:
          "2\\d{2}":
            statusCode: "201"
```

and finally e.g. a file containing the gateway schema validation
```yml
#integrations/validation.yml
x-amazon-apigateway-request-validators:
  all:
    validateRequestBody: true
    validateRequestParameters: true
  disabled:
    validateRequestBody: false
    validateRequestParameters: false
x-amazon-apigateway-request-validator: all
```

Now you can easily create a combined amazon gateway compatible openapi specification file that can be referenced in your serverless resources

```shell
#Create OpenApi File containing mocking responses (usable in functional tests) and deploy to ApiGateway
serverless deploy stage==test
```

```shell
#Create OpenApi File containing the production integration and deploy to ApiGateway
serverless deploy --stage=prod
```

The generated output is automatically injected in the **resources.Resources.ApiGatewayRestApi.Properties.Body** property
```yml
resources:
  Resources:
    ApiGatewayRestApi:
      Type: AWS::ApiGateway::RestApi
      Properties:
        ApiKeySourceType: HEADER
        Body: ~ #autogenerated by plugin
        Description: "Some Description"
        FailOnWarnings: false
        Name: ${opt:stage, self:provider.stage}-some-name
        EndpointConfiguration:
          Types:
            - REGIONAL
    ApiGatewayDeployment:
      Type: AWS::ApiGateway::Deployment
      Properties:
        RestApiId:
          Ref: ApiGatewayRestApi
        StageName: ${opt:stage, self:provider.stage}
```

# Commands

The generate command can be used independently with
```yml
serverless integration merge --stage=dev
```
Of course then the API Gateway Body property has to be specified manually

```yml
resources:
  Resources:
    ApiGatewayRestApi:
      Type: AWS::ApiGateway::RestApi
      Properties:
        ApiKeySourceType: HEADER
        Body: ${file(openapi-integration/api.yml)}
```

# CORS generator

The plugin can generate full CORS support out of the box. 
```yml
openApiIntegration:
  cors: true
  ...
```

If enabled, the **integration merge** command generates all required OPTIONS methods as well as the required header informations and adds a mocking response to API Gateway. 
You can customize the CORS templates by placing your own files inside a directory **openapi-integration** (in your project root). The following files can be overwritten:

| Filebame        | Description |
| ------------- |:-------------:| 
| headers.yml    | All headers required for CORS support |
| integration.yml      | Contains the x-amazon-apigateway-integration block  |
| path.yml| OpenApi specification for the OPTIONS method       |
| response-parameters.yml| The response Parameters of the x-amazon-apigateway-integration responses      |

See the EXAMPLES directory for detailed instructions.

# Configuration Reference

configure the plugin under the key **openApiIntegration**

```yml
openApiIntegration:
  inputFile: schema.yml #required
  inputDirectory: ./ #optional, defaults to ./
  cors: true #optional, defaults to false
  mapping: #required for at least one stage, where to read the aws integration files from (file or directory)
    - path: integrations 
      stage: dev
    - path: integrations
      stage: prod
    - path: mocks/customer.yml
      stage: test
  outputFile: api.yml #optional, defaults to api.yml
  outputDirectory: openapi-integration #optional, defaults to ./openapi-integration
```

# Example
```yml
service:
  name: user-registration

provider:
  name: aws
  stage: dev
  region: eu-central-1

plugins:
  - serverless-openapi-integration-helper

custom:
  baseUrl: http://example.comapi/xyz
  
openApiIntegration:
  inputFile: schema.yml
  mapping:
    - path: integrations
      stage: dev
    - path: integrations
      stage: prod
    - path: mocks/customer.yml
      stage: test

functions:

resources:
  Resources:
    ApiGatewayRestApi:
      Type: AWS::ApiGateway::RestApi
      Properties:
        ApiKeySourceType: HEADER
        Body: ${file(openapi-integration/api.yml)}
        Description: "Some Description"
        FailOnWarnings: false
        Name: ${opt:stage, self:provider.stage}-some-name
        EndpointConfiguration:
          Types:
            - REGIONAL
    ApiGatewayDeployment:
      Type: AWS::ApiGateway::Deployment
      Properties:
        RestApiId:
          Ref: ApiGatewayRestApi
        StageName: ${opt:stage, self:provider.stage}
```

```
serverless integration merge --stage=test && serverless deploy --stage=test
```

```
serverless integration merge --stage=prod && serverless deploy --stage=prod
```

# Approach to a functional test of schema validation
The plugin works well in combination with the [serverless-plugin-test-helper](https://www.npmjs.com/package/serverless-plugin-test-helper) to automate tests against the deployed api gateway

## Install The plugin test helper package

```shell
npm install --save-dev serverless-plugin-test-helper
```

add the plugin as a plugin dependency in your serverless configuration file and configure the plugin according to the [Readme](https://www.npmjs.com/package/serverless-plugin-test-helper)
```yml
#./serveless.yml
plugins:
  - serverless-plugin-test-helper
  - serverless-openapi-integration-helper

custom:
  output:
    handler: scripts/output.handler
    file: stack.json

[...]

Resources:
  Outputs:
    GatewayUrl: # This is the key that will be used in the generated outputs file
      Description: This is a helper for functional tests
      Value: !Join
        - ''
        - - 'https://'
          - !Ref ApiGatewayRestApi
          - '.execute-api.'
          - ${opt:region, self:provider.region}
          - '.amazonaws.com/'
          - ${opt:stage, self:provider.stage}
    ApiGatewayRestApi:
      Type: AWS::ApiGateway::RestApi
      Properties:
        ApiKeySourceType: HEADER
        Body: ${file(openapi-integration/api.yml)}
        Description: User Registration (${opt:stage, self:provider.stage})
        FailOnWarnings: false
        Name: ${opt:stage, self:provider.stage}-gateway
        EndpointConfiguration:
          Types:
            - REGIONAL
    ApiGatewayDeployment:
      Type: AWS::ApiGateway::Deployment
      Properties:
        RestApiId:
          Ref: ApiGatewayRestApi
        StageName: ${opt:stage, self:provider.stage}
```

## Testing the schema validation
Add a functional test (e.g. with jest)

```javascript
//tests/registration.js
import {getOutput} from 'serverless-plugin-test-helper';
import axios from 'axios';

axios.defaults.adapter = require('axios/lib/adapters/http'); //Todo

const URL = getOutput('GatewayUrl');
test('request validation on registration', async () => {
    expect.assertions(1);
    const {status} = await axios.post(URL + '/api/v1/user',
        {
            "email_address": "test@example.com",
            "password": "someStrongPassword#"
        },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        });
    expect(status).toEqual(201);
});

test('request validation on registration (invalid request)', async () => {
    expect.assertions(1);
    try {
        await axios.post(URL + '/api/v1/user',
            {
                "email": "test@example.com"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    } catch (e) {
        expect(e.response).toMatchObject({
            statusText: 'Bad Request',
            status: 400
        });
    }
});
```
Then perform the functional test
```shell
serverless integration merge --stage=test && serverless deploy --stage test
npm test
serverless remove --stage test
```

The command will
- merge the openapi specification file with the MOCK integration configured before
- deploy to API Gateway in an isolated TEST infrastructure environment (your other environments will not be affected since we are deploying to a separated gateway)
- perform the test and verify that schema validation is correct
- remove all TEST resources if test succeeded

See the **examples** folder for a full working [example](https://github.com/yndlingsfar/serverless-openapi-integration-helper/tree/main/examples)
