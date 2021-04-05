# Serverless Plugin: AWS Gateway integration helper

The plugin provides helper functions for a seamless AWS Gateway integration

## Separate AWS Extension Syntax from Open Api Specification
In some cases it is needed to separate the x-amazon-apigateway extension syntax from your open api specification file. 
A valid use-cases could be to keep your code clean or if you want to define different gateway types targets based on your environment (http_proxy and mock e.g.)

## Table of contents

- [Install](#install)
- [Basic Usage](#basic-usage)

## Install

Run `npm install` in your Serverless project.

`$ npm install --save-dev serverless-openapi-integration-helper`

Add the plugin to your serverless.yml file

```yml
plugins:
  - serverless-openapi-integration-helper
```

## Basic usage

Given you have following OpenApi Specification 3 (OAS3) file *oas3.yml*
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

another file *mock.yml* containing a mock integration

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

and finally a file *production.yml* containing the production integration

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

your serverless.yml file would look like:

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

functions:

resources:
  Resources:
    ApiGatewayRestApi:
      Type: AWS::ApiGateway::RestApi
      Properties:
        ApiKeySourceType: HEADER
        Body: ${file(./api.yml)}
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

You are now able to run different integrations based on your environment

```
serverless integration merge --definition oas3.yml --integration mock.yml --output api.yml
serverless deploy --stage=test
```

```
serverless integration merge --definition oas3.yml --integration production.yml --output api.yml
serverless deploy --stage=prod
```

It is possible to merge all yml files in a directory by specifying a directory as --integration parameter
```
serverless integration merge --definition oas3.yml --integration some_directory --output api.yml
serverless deploy --stage=prod
```

