# Serverless pluing: AWS Gateway integration helper

The plugin provides helper functions for a seamless AWS Gateway integration

## Separate AWS Extension Syntax from Open Api Specification
In some cases it is needed to separate the x-amazon-apigateway extension syntax from your open api specification file. 
A valid use-cases could be to keep your code clean or if you want to define different gateway types targets based on your environment (http_proxy and mock e.g.)

Given you have following OAS3 file *oas3.yml*
```
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

```
paths:
  /api/v1/customer:
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

```
paths:
  /api/v1/customer:
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

```
service:
  name: user-registration

provider:
  name: aws
  stage: dev
  region: eu-central-1

plugins:
  - serverless-openapi-integration-helper

custom:
  dev:
    host: dev.example.com
  test:
    host: test.example.com
  baseUrl: http://${self:custom.${opt:stage, self:provider.stage}.host}/api/xyz

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

