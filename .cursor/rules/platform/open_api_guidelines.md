# OpenAPI Creation Guidelines

This document provides comprehensive guidelines for creating OpenAPI (Swagger) specifications that follow Flywire's standards and best practices.

## Core Principles

### 1. Use Reusable Schemas (components.schemas)
Promote reusability and keep documentation DRY by defining shared schemas:

```yaml
components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: string
          format: uuid
          description: Unique user identifier
        name:
          type: string
          description: Full name of the user
        email:
          type: string
          format: email
          description: Valid email address
```

**Best Practices:**
- Define required fields explicitly
- Always include descriptions for each property
- Use appropriate formats (uuid, email, date, etc.)

### 2. Multiple Examples per Request/Response
Document different valid payloads for the same endpoint:

```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/Payment'
      examples:
        creditCardExample:
          summary: Credit card payment
          value:
            method: credit_card
            card_number: "4111111111111111"
            expiry: "12/25"
        paypalExample:
          summary: PayPal payment
          value:
            method: paypal
            paypal_email: "user@example.com"
```

**Best Practices:**
- Use `examples` for multiple named examples
- Use `example` for single inline examples
- Add meaningful summaries and descriptions

### 3. Comprehensive Descriptions and External Links
Improve clarity with detailed descriptions and references:

```yaml
paths:
  /users:
    get:
      summary: Retrieve users list
      description: |
        Returns a paginated list of active users in the system.  
        [Learn more about pagination](https://api.flywire.com/docs/pagination)
      externalDocs:
        description: User management guide
        url: https://docs.flywire.com/users
```

**Best Practices:**
- Use multiline descriptions for complex operations
- Include Markdown links in descriptions
- Use `externalDocs` for additional documentation (can be used globally, per operation, or per schema)

### 4. Environment Configuration (servers)
Define all deployment environments:

```yaml
servers:
  - url: https://api-platform.flywire.com/v1
    description: Production environment
  - url: https://api-platform-sandbox.flywire.com/v1
    description: Sandbox environment
  - url: http://localhost:8080/v1
    description: Local development
```

**Best Practices:**
- Always define production and staging/sandbox environments
- Include version in URL path when applicable (/v1, /v2, etc.)
- Provide clear environment descriptions

### 5. Types, Formats, and Validation
Define clear constraints and validation rules:

```yaml
components:
  schemas:
    Payment:
      type: object
      required: [method, amount, currency]
      properties:
        method:
          type: string
          enum: [credit_card, paypal, bank_transfer]
          description: Accepted payment methods
        amount:
          type: number
          format: float
          minimum: 0.01
          maximum: 10000.00
          description: Amount between 0.01 and 10000.00
        currency:
          type: string
          pattern: '^[A-Z]{3}$'
          description: Currency code in ISO 4217 format (EUR, USD)
```

**Best Practices:**
- Use `enum` to restrict accepted values
- Apply validation rules: `minimum`, `maximum`, `pattern`, `minLength`, `maxLength`
- Specify appropriate formats: `date-time`, `uri`, `email`, `uuid`

## Complete OpenAPI Example Structure

```yaml
openapi: 3.0.0
info:
  title: Payments API
  version: 1.0.0
  description: API to manage customer payments

externalDocs:
  description: Full API documentation
  url: https://docs.flywire.com/payments

servers:
  - url: https://api-platform.flywire.com/v1
    description: Production
  - url: https://api-platform-sandbox.flywire.com/v1
    description: Sandbox

paths:
  /payments:
    post:
      summary: Create payment
      description: |
        Creates a new payment using the specified method.  
        See [payment guide](https://docs.flywire.com/payments/create) for details.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Payment'
            examples:
              creditCard:
                summary: Credit card payment
                value:
                  method: credit_card
                  amount: 99.95
                  currency: EUR
              paypal:
                summary: PayPal payment
                value:
                  method: paypal
                  amount: 49.99
                  currency: USD
      responses:
        '201':
          description: Payment successfully created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaymentResponse'
        '400':
          $ref: '#/components/responses/BadRequest'

components:
  schemas:
    Payment:
      type: object
      required: [method, amount, currency]
      properties:
        method:
          type: string
          enum: [credit_card, paypal, bank_transfer]
          description: Payment method
        amount:
          type: number
          format: float
          minimum: 0.01
          maximum: 10000.00
          description: Amount to charge (0.01–10000.00)
        currency:
          type: string
          pattern: '^[A-Z]{3}$'
          description: Currency in ISO 4217 format (EUR, USD)
    
    PaymentResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
          description: Unique identifier for the payment
        status:
          type: string
          enum: [pending, completed, failed]
          description: Status of the payment
        created_at:
          type: string
          format: date-time
          description: Payment creation timestamp

  responses:
    BadRequest:
      description: Invalid request payload
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    Error:
      type: object
      properties:
        type:
          type: string
          description: Error type identifier
        title:
          type: string
          description: Human-readable error title
        status:
          type: integer
          description: HTTP status code
        detail:
          type: string
          description: Detailed error message
```

## Implementation Checklist

- [ ] Define all schemas in `components.schemas` for reusability
- [ ] Include multiple examples for complex request/response bodies
- [ ] Add comprehensive descriptions with Markdown links
- [ ] Configure all environment servers (production, sandbox, local)
- [ ] Use appropriate data types, formats, and validation rules
- [ ] Follow RFC-7807 error response format
- [ ] Include external documentation links where helpful
- [ ] Validate OpenAPI specification syntax
- [ ] Test examples against actual API implementation
- [ ] Register specification in api-docs.flywire.com