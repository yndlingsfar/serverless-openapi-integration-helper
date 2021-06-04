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
1. [AUTO-MOCK Generator](#auto-mock-generator)
1. [VALIDATION Generator](#validation-generator)
1. [Configuration Reference](#configuration-reference)
1. [Known Issues](#known-issues)
   1. [Stage Deployment](#stage-deployment)
   1. [Variable Resolving](#variable-resolving)
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
- auto-generating CORS methods, headers and api gateway mocking response
- hook into package & deploy lifeCycle and generate combined openApi files on the fly during deployment
- auto-inject generated openApi file into the Body property of specified API Gateway
- **[NEW]:** generate mocking responses without specifying x-amazon-apigateway-integration blocks
- **[NEW]:** generate request-validation blocks

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

```yml
openApiIntegration:
    package: true #New feature! Hook into the package & deploy process
    inputFile: schema.yml
    mapping:
       - stage: [dev, prod] #multiple stages
         path: integrations
       - stage: test #single stage
         path: mocks/customer.yml
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
        uri: https://www.example.com/users
        type: "http"
        passthroughBehavior: "when_no_match"
        responses:
          "2\\d{2}":
            statusCode: "201"
```

Now you can easily create a combined amazon gateway compatible openapi specification file that is automatically injected in your serverless resources

```shell
#Create OpenApi File containing mocking responses (usable in functional tests) and deploy to ApiGateway
serverless deploy --stage==test
```

```shell
#Create OpenApi File containing the production integration and deploy to ApiGateway
serverless deploy --stage=prod
```

The generated output is automatically injected in the **resources.Resources.YOUR_API_GATEWAY.Properties.Body** property
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

If enabled, the plugin generates all required OPTIONS methods as well as the required header informations and adds a mocking response to API Gateway. 
You can customize the CORS templates by placing your own files inside a directory **openapi-integration** (in your project root). The following files can be overwritten:

| Filename        | Description |
| ------------- |:-------------:| 
| headers.yml    | All headers required for CORS support |
| integration.yml      | Contains the x-amazon-apigateway-integration block  |
| path.yml| OpenApi specification for the OPTIONS method       |
| response-parameters.yml| The response Parameters of the x-amazon-apigateway-integration responses      |

See the [EXAMPLES](https://github.com/yndlingsfar/serverless-openapi-integration-helper/tree/main/examples) directory for detailed instructions.

# Auto Mock Generator
If enabled, the plugin generates mocking responses for all methods that do not have an x-amazon-apigateway-integration block defined.
It takes the first 2xx response defined in the openApi specification and generates a simple mocking response on the fly
```yml
openApiIntegration:
  autoMock: true
  ...
```

When using the autoMock feature, you do not need to specify inputPath mappings, since all endpoints are mocked automatically

```yml
openApiIntegration:
    package: true
    inputFile: schema.yml
    mapping: ~
```

# VALIDATION generator

The plugin can generate full CORS support out of the box.
```yml
openApiIntegration:
  validation: true
  ...
```

If enabled, the plugin generates the x-amazon-apigateway-request-validators blocks and adds a basic request validation to all methods.
You can customize the VALIDATION template by placing your own files inside a directory **openapi-integration** (in your project root). The following files can be overwritten:

| Filename        | Description |
| ------------- |:-------------:| 
| request-validator.yml    | The x-amazon-apigateway-request-validators block |

See the [EXAMPLES](https://github.com/yndlingsfar/serverless-openapi-integration-helper/tree/main/examples) directory for detailed instructions.

# Configuration Reference

configure the plugin under the key **openApiIntegration**

```yml
openApiIntegration:
  inputFile: schema.yml #required
  package: true #optionl defaults to false 
  inputDirectory: ./ #optional, defaults to ./
  cors: true #optional, defaults to false
  autoMock: true #optional, defaults to false
  validation: true #optional, defaults to false
  mapping: #optional, can be completely blank if autoMock option is enabled
    - stage: [dev, prod] #multiple stages
      path: integrations 
    - stage: test #single stage
      path: mocks/customer.yml
  outputFile: api.yml #optional, defaults to api.yml
  outputDirectory: openapi-integration #optional, defaults to ./openapi-integration
```

# Known Issues

## Stage deployment
When using serverless framework only to deploy your aws resources **without having any lambda functions or triggers**, the AWS Gateway deploymemt does not behave as expected.
Any deployment to an existing stage will be ignored, since CloudFormation does not redeploy a stage if the DeploymentIdentifier has not changed.

The plugin [serverless-random-gateway-deployment-id](https://www.npmjs.com/package/serverless-random-gateway-deployment-id) solves this problem by adding a random id to the deployment-name and all references to it on every deploy

See the **examples** folder for a full working [example](https://github.com/yndlingsfar/serverless-openapi-integration-helper/tree/main/examples)

## Variable Resolving
Serverless variables inside the openapi integration files are not resolved correctly when using the package & deploy hooks. This problem can be solved by using the api gateway STAGE VARIABLES.

See the **examples** folder for a full working [example](https://github.com/yndlingsfar/serverless-openapi-integration-helper/tree/main/examples)

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
  
openApiIntegration:
  inputFile: schema.yml
  package: true
  mapping:
    - path: integrations
      stage: [dev, prod]
    - path: mocks/customer.yml
      stage: test

functions:

resources:
  Resources:
    ApiGatewayRestApi:
      Type: AWS::ApiGateway::RestApi
      Properties:
        ApiKeySourceType: HEADER
        Body: ~
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
serverless deploy --stage=test
```

```
serverless deploy --stage=prod
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

[...]

resources:
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

   Resources:
    ApiGatewayRestApi:
      Type: AWS::ApiGateway::RestApi
      Properties:
        ApiKeySourceType: HEADER
        Body: ~
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
serverless deploy --stage=test
npm test
serverless remove --stage=test
```

The command will
- merge the openapi specification file with the MOCK integration configured before
- deploy to API Gateway in an isolated TEST infrastructure environment (your other environments will not be affected since we are deploying to a separated gateway)
- perform the test and verify that schema validation is correct
- remove all TEST resources if test succeeded

See the **examples** folder for a full working [example](https://github.com/yndlingsfar/serverless-openapi-integration-helper/tree/main/examples)
