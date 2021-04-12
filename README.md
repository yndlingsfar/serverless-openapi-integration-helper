# Serverless Plugin: AWS Gateway integration helper

The plugin provides helper functions for separating the x-amazon-apigateway extensions from your OpenApi Specification file.

**Currently only works with yml based openapi 3 specification files**

## Use Cases
- spin up different x-amazon-apigateway integrations based on your stage
- separate infrastructure (aws) from openapi specification
- use mock integrations for functional testing

## Table of contents

- [Install](#install)
- [Basic Usage](#basic-usage)
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

## Configuration Reference

configure the plugin under the key **openApiIntegration**

```yml
openApiIntegration:
  inputFile: schema.yml #required
  inputDirectory: ./ #optional, defaults to ./
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

