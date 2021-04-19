# Serverless Plugin: AWS Gateway integration helper

The plugin provides helper functions for separating the x-amazon-apigateway extensions from your OpenApi Specification file.

**Currently only works with yml based openapi 3 specification files**

## Use Cases
- spin up different x-amazon-apigateway integrations based on your stage
- separate infrastructure (aws) from openapi specification
- use mock integrations for functional testing
- **[NEW]:** auto-generating CORS methods, headers and api gateway mocking response

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

The mapping array must be used to tell the plugin where to look for files containing the **x-amazon-apigateway-integration** blocks. The mapping is done per stage.

```yml
openApiIntegration:
    inputFile: schema.yml
    mapping:
      - path: schemas
        stage: dev
      - path: schemas
        stage: prod
      - path: mocks/customer.yml
        stage: test
```

For example if in dev environment all .yml files inside the schemas directory will be processed when running 
```
serverless integration merge --stage=test && serverless deploy --stage=dev
```

## CORS generator

The plugin can generate full CORS support out of the box. 
```yml
openApiIntegration:
  cors: true
  ...
```

If enabled, the plugin will generate all required OPTIONS methods as well as the required header informations and adds a mocking response to api gateway. 
You can customize the CORS templates by placing your own files inside a directory called **openapi-integration/** (in the directory root). The following files can be overwritten:

| Filebame        | Description |
| ------------- |:-------------:| 
| headers.yml    | All headers required for CORS support |
| integration.yml      | Contains the x-amazon-apigateway-integration block       |
| parameters.yml | Header mappings for the x-amazon-apigateway-integration responses block       |
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

## Basic usage
**Given you have following OpenApi Specification 3 (OAS3) file *schema.yml***
```yml
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

**another file *mocks/customer.yml* containing a mock integration (used in functional testing)**

```yml
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

**and finally a file *schemas/customer.yml* containing the production integration**

```yml
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

The integration merge command generates a combined file that can be used for spinning up aws resources
```yml
serverless integration merge --stage=test
```

You can reference the generated output under the resources key in your serverless file
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
    - path: schemas
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

