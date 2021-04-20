# Serverless Plugin: AWS Gateway integration helper
<p align="center">
  <a href="https://npmjs.com/package/serverless-openapi-integration-helper">
    <img src="https://flat.badgen.net/npm/v/serverless-openapi-integration-helper?icon=npm&label=npm@latest"></a>
<a href="https://www.npmjs.com/package/serverless-openapi-integration-helper">
    <img src="https://flat.badgen.net/npm/dt/serverless-openapi-integration-helper?icon=npm"></a>
  <a href="https://codecov.io/gh/manwaring/serverless-openapi-integration-helper">
    <img src="https://flat.badgen.net/codecov/c/github/manwaring/serverless-openapi-integration-helper/?icon=codecov"></a>
  <a href="https://packagephobia.now.sh/result?p=serverless-plugin-test-helper">
    <img src="https://flat.badgen.net/packagephobia/install/serverless-openapi-integration-helper"></a>
  <a href="https://www.npmjs.com/package/serverless-openapi-integration-helper">
    <img src="https://flat.badgen.net/npm/license/serverless-openapi-integration-helper"></a>
  <br/>

</p>

The plugin provides helper functions for separating the x-amazon-apigateway extensions from your OpenApi (former swagger) Specification file.

**The plugin support YML based OpenApi3 specification files**

## Features
- deploy stage dependent x-amazon-apigateway integrations
- separate infrastructure (aws) from openapi specification
- use mock integrations for functional testing
- **[NEW]:** auto-generating CORS methods, headers and api gateway mocking response

See the **examples** folder for a full working [example](https://github.com/yndlingsfar/serverless-openapi-integration-helper/tree/main/examples)

## Table of contents

- [Install](#install)
- [Configuration](#configuration)  
- [Basic Usage](#basic-usage)
- [CORS Generator](#cors-generator)
- [Configuration Reference](#configuration-reference)
- [Example](#example)

## Install

Run `npm install` in your Serverless project.

`$ npm install --save-dev serverless-openapi-integration-helper`

Add the plugin to your serverless.yml file

```yml
plugins:
  - serverless-openapi-integration-helper
```
## Configuration
You can configure the plugin under the key **openApiIntegration**. See
See [Configuration Reference](#configuration-reference) for a list of available options

The mapping array must be used to configure where the files containing the **x-amazon-apigateway-integration** blocks are located. 

**Each available stage needs its own mapping entry**

```yml
openApiIntegration:
    inputFile: schema.yml
    mapping:
      - path: integrations
        stage: dev
      - path: schemas
        stage: prod
      - path: mocks/customer.yml
        stage: test
```

In the above example all YML files inside the schemas directory will be processed if running the integration command with stage=dev parameter
```shell
serverless integration merge --stage=dev
```

To use a different x-amazon-apigateway to perform functional tests (with a mocking response) the file mock/customer.yml is processed if running the integration command with stage=test parameters
```shell
serverless integration merge --stage=test
```

## Basic usage
With an existing OpenApi Specification file you can easily setup a fully working api gateway.

**First create the input file containing the [OpenApiSpecification](https://swagger.io/specification/)
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

**and finally create one or more files containing the production integration**

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

and for example a file containing the gateway validation
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

The **integration merge** command generates a combined file that can be used for spinning up aws resources
```shell
#Create OpenApi File containing mocking responses (usable in functional tests)
serverless integration merge --stage=test
```

```shell
#Create OpenApi File containing the production integration
serverless integration merge --stage=prod
```

The generated output file can be referenced under the resources key in your serverless file to deploy the API Gateway
```yml
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

## CORS generator

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

See the EXAMPLES directory for detailed instructions.

## Configuration Reference

configure the plugin under the key **openApiIntegration**

```yml
openApiIntegration:
  inputFile: schema.yml #required
  inputDirectory: ./ #optional, defaults to ./
  cors: true #optional, defaults to false
  mapping: #required for at least one stage, where to read the aws integration files from (file or directory)
    - path: schemas 
      stage: dev
    - path: schemas
      stage: prod
    - path: mocks/customer.yml
      stage: test
  outputFile: api.yml #optional, defaults to api.yml
  outputDirectory: openapi-integration #optional, defaults to ./openapi-integration
```

## Example
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
    - path: schemas
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

