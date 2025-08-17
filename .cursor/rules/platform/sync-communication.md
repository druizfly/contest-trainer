# Sync Communication Rules

HTTP APIs provide synchronous request-response communication between services and clients. Standardized HTTP API design ensures:
- **Consistency**: Uniform patterns across all Flywire services
- **Developer Experience**: Predictable and intuitive API interactions
- **Maintainability**: Clear contracts and documentation standards
- **Scalability**: Proper error handling and rate limiting

The Flywire platform is a collection of reusable services that encapsulate business capabilities. APIs should enable consistent design patterns and facilitate a grateful developer experience by allowing quick composition of business processes.

## Core Principles

### RESTful Design
- **HTTP-based REST API**: Standard REST architectural principles
- **Resource-oriented**: Expose business capabilities as resources
- **Stateless**: Each request contains all necessary information
- **JSON format**: All requests and responses use JSON

## API Configuration

### Base URLs
```
https://api-platform.flywire.com/          # Production
https://api-platform-sandbox.flywire.com/  # Sandbox
https://service.flywire.com/               # Service-specific
```

### Versioning Rules
- **URL versioning**: `/v{version}/` (e.g., `/v3/`)
- **Non-breaking changes**: Can be added without version increment
- **Breaking changes**: Require new API version

## Request Structure

### HTTP Methods
| Method | Purpose | Description |
|--------|---------|-------------|
| `GET` | Retrieve | Retrieves data from a resource or collection |
| `POST` | Create | Creates a new resource |
| `PATCH` | Update Partial | Updates a resource partially |
| `PUT` | Update Complete | Updates a resource completely |
| `DELETE` | Remove | Deletes an existing resource |

### URL Structure
```
https://service.flywire.com/api/v{version}/{resource}
https://service.flywire.com/api/v{version}/{resource}/{identifier}
https://service.flywire.com/api/v{version}/{resource}/{identifier}/{sub-resource}
```

## Authentication

### Recommended Approach
Most Flywire services use the `X-Authentication-Key` header for API authentication:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Authentication-Key: your_api_key" \
  -d '{"field": "value"}' \
  https://service.flywire.com/api/v3/resource
```

### Alternative Authentication Methods
Some services may implement different authentication mechanisms:
- **Bearer Token**: `Authorization: Bearer <token>`
- **Custom Headers**: Service-specific authentication headers
- **OAuth 2.0**: For third-party integrations

Consult the specific service documentation for authentication requirements.

### Request Example
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Authentication-Key: your_api_key" \
  -d '{"field": "value"}' \
  https://service.flywire.com/api/v3/resource
```

## Response Structure

### HTTP Status Codes

#### Success Responses
| Status | Description |
|--------|-------------|
| `200 OK` | Request has been successfully processed |
| `201 Created` | Create resource operation successfully performed |

#### Client Error Responses (4xx)
| Status | Description | Should Retry? |
|--------|-------------|---------------|
| `400 Bad Request` | Incorrectly formatted request | No |
| `401 Unauthorized` | Missing or invalid credentials | No |
| `404 Not Found` | Resource not found | No |
| `422 Unprocessable Entity` | Data validation or business rule failures | No |
| `429 Rate Limit Exceeded` | Exceeded rate limit | Yes (after delay) |

#### Server Error Responses (5xx)
| Status | Description | Should Retry? |
|--------|-------------|---------------|
| `500 Internal Server Error` | Unexpected server condition | Yes |
| `503 Service Unavailable` | Temporary server unavailability | Yes |

#### Success (201 Created)
```json
{"id": "123", "status": "created"}
```

### Error Response Format (RFC-7807 Standard)
```json
{
  "type": "https://developers.flywire.com/errors/unprocessable_entity",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "The request contains invalid parameters",
  "errors": [
    {
      "source": "/resource/field_name",
      "param": "field_name",
      "type": "missing_param",
      "message": "is missing"
    },
    {
      "source": "/resource/other_field",
      "param": "other_field",
      "type": "invalid_param",
      "message": "is invalid"
    }
  ]
}
```

#### Standard Error Types
- `bad_request` - Malformed request
- `unauthorized_request` - Invalid or expired authentication
- `not_found` - Resource not found
- `unprocessable_entity` - Validation failure
- `server_error` - Internal server error
- `service_unavailable` - Service temporarily unavailable
- `missing_param` - Required parameter missing
- `invalid_param` - Parameter validation failed

## Collection Handling

### Filtering and Search
Use query parameters for filtering:
```http
GET /api/v3/resources?status=active
GET /api/v3/resources?created_at_start_date=2017-12-12&created_at_end_date=2017-12-13
```

### Pagination

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | string (optional) | Non-zero integer representing the page number |
| `per_page` | string (optional) | Non-negative, non-zero integer for max results (default: 10) |

#### Response Structure
```json
{
  "total_entries": 40,
  "total_pages": 4,
  "resources": [
    {
      "id": "123",
      "created_at": "2017-12-12T20:30:01Z",
      "links": [
        {"href": "/api/v3/resources/123", "rel": "self", "method": "GET"}
      ]
    }
  ],
  "links": [
    {"href": "/api/v3/resources?page=2&per_page=10", "rel": "self", "method": "GET"},
    {"href": "/api/v3/resources?page=1&per_page=10", "rel": "first", "method": "GET"},
    {"href": "/api/v3/resources?page=1&per_page=10", "rel": "prev", "method": "GET"},
    {"href": "/api/v3/resources?page=3&per_page=10", "rel": "next", "method": "GET"},
    {"href": "/api/v3/resources?page=4&per_page=10", "rel": "last", "method": "GET"}
  ]
}
```

#### Page Navigation Links
| Relationship | Description |
|--------------|-------------|
| `self` | Current page of the result list |
| `first` | First page (not present when only one page) |
| `last` | Last page (optional, not present when only one page) |
| `next` | Next page (not present when on last page) |
| `prev` | Previous page (not present when on first page) |

### Date Range Selection
Use standardized date range parameters:
```
{parameter_name}_start_date=YYYY-MM-DD
{parameter_name}_end_date=YYYY-MM-DD
```

## HATEOAS Implementation (Optional)

HATEOAS (Hypermedia as the Engine of Application State) can be implemented to provide navigation links within API responses. This is **optional** and services can choose whether to implement it based on their specific needs.

### Link Structure (When Implemented)
```json
{
  "links": [
    {
      "href": "https://service.flywire.com/api/v3/resources/123",
      "rel": "self",
      "method": "GET"
    },
    {
      "href": "https://service.flywire.com/api/v3/resources/123/actions",
      "rel": "actions",
      "method": "POST"
    }
  ]
}
```

### Link Components
| Component | Description |
|-----------|-------------|
| `href` | The target URL |
| `rel` | The resource type the link points to |
| `method` | The HTTP method |

### Benefits of HATEOAS
- **Discoverability**: Clients can discover available actions dynamically
- **Loose Coupling**: Reduces client dependency on hardcoded URLs
- **API Evolution**: Easier to evolve APIs without breaking clients

## Data Types

### Standard Types
| Type | Description | Example |
|------|-------------|---------|
| `Currency` | 3-letter ISO 4217 standard | `"EUR"`, `"USD"` |
| `Country` | 2-letter ISO-3166 standard | `"ES"`, `"US"` |
| `DateTime` | Internet date and time format (ISO 8601) | `"2017-09-10T10:38:03Z"` |
| `Decimal` | Numbers with fractional parts | `1.23` |
| `String` | UTF-8 characters, max 255 unless noted | `"Example"` |
| `Object` | Key-value pairs | `{"key": "value"}` |

### Money Type
Money objects include value in smallest currency unit and currency information:

#### Standard Format
```json
{
  "value": 10000,
  "currency": {
    "code": "EUR",
    "name": "Euro",
    "decimal_mark": ",",
    "plural_name": "Euros",
    "subunit_to_unit": 100,
    "symbol": "€",
    "symbol_first": true,
    "thousands_separator": "."
  }
}
```

#### Minimal Format
```json
{
  "value": 10000,
  "currency": {
    "code": "EUR",
    "subunit_to_unit": 100
  }
}
```

## Documentation Standards

### OpenAPI Specification
All HTTP APIs must be documented using OpenAPI (formerly Swagger) specifications:

- **OpenAPI Version**: Use OpenAPI 3.0+ specification format
- **File Location**: Create `open_api.json` or `open_api.yaml` in your repository's `docs/open_api` folder. Use entity as filename when applicable, for example `payments.json`
- **Completeness**: Document all endpoints, request/response schemas, and error responses
- **Examples**: Include request/response examples for all endpoints
- **Validation**: Ensure OpenAPI spec is valid and up-to-date with implementation
- **Creation Guidelines**: When creating or modifying OpenAPI specifications, follow the detailed [OpenAPI Guidelines](open_api_guidelines.md)

### API Documentation Portal
- **Publication**: Register your OpenAPI specification in [api-docs.flywire.com](https://api-docs.flywire.com)
- **Repository**: Use the [Api Docs Repository](https://gitlab.flywire.tech/flywire/development/api-docs) (GitLab Project ID: 193)
- **Organization**: Group APIs by service and maintain version history

### Required Documentation Elements
- **API Overview**: Service description and purpose
- **Authentication**: Supported authentication methods
- **Rate Limits**: Request rate limitations and quotas
- **Error Codes**: Complete list of error responses with examples
- **Changelog**: Version history and breaking changes
- **Getting Started**: Quick start guide with example requests

## HTTP Client Best Practices

### Request Guidelines
When making HTTP requests from services, follow these practices:

- **Filter sensitive data**: Filter headers or sensitive fields in the body when logging
- **User-Agent header**: Always include your application name following the User-Agent specification
- **Response validation**: Always check response code and react accordingly
- **Timeout management**: Set appropriate timeouts based on expected response times
- **Retry strategies**: Implement retry logic for transient failures
- **Circuit breakers**: Consider adding circuit breakers to prevent flooding external services during failures

### User-Agent Specification
All HTTP requests should include a properly formatted User-Agent header to maintain consistency across the Flywire platform.

#### Format for Client Library/Gem Requests
```
Flywire service-name/version library/version [context]
```

Examples:
- `Flywire pricing/695865b exchange-gem/1.3.4`
- `Flywire pricing/1.0 exchange-gem/1.3.4`
- `Flywire pricing exchange-gem/1.3.4`
- `Flywire flywire-core/1.0 refunds-client/1.3.4 refunds`

#### Format for Service-to-Service Calls
```
Flywire service-name/version [context]
```

Examples:
- `Flywire operations/2181c16`
- `Flywire operations/2.0`
- `Flywire operations`
- `Flywire operations http-client/1.0`
- `Flywire flywire-core/1.0 refunds`

#### User-Agent Components
- **Flywire**: Always include to identify platform origin
- **Service name**: Retrieved from `CI_PROJECT_NAME` environment variable
- **Version**: Optional - can use version ID or short SHA
- **Library/gem**: Name and version of the client library
- **Context**: Optional business context specification

### Ruby-Specific Recommendations
- **HTTP Client**: Use Faraday gem for HTTP calls
- **Tracing**: Use [Flotel](https://gitlab.flywire.tech/flywire/development/gems/dev-flotel/flotel) instrumentations
- **Logs**: Use [Flotel](https://gitlab.flywire.tech/flywire/development/gems/dev-flotel/flotel/-/tree/master/lib/flotel) Flotel::Logger and Flotel::HttpLogger
- **Reference**: See [Auth Client implementation](https://gitlab.flywire.tech/flywire/development/gems/flywire-auth-rb/-/blob/c41a10ac012de6b90ca80eb283dde939d39ae557/lib/flywire_auth/requester.rb) for example

## Implementation Guidelines

### Consistency Requirements
- **Authentication**: Use appropriate authentication method for your service (X-Authentication-Key recommended)
- **Content-Type**: Always set to `application/json`
- **Error format**: Follow RFC-7807 standard with errors array
- **Date formats**: Always use ISO 8601 format
- **Money representation**: Always use value + currency object
- **Pagination**: Always include total counts and navigation links
- **HATEOAS**: Optionally include relevant navigation links when beneficial

### Best Practices
- **Environment separation**: Use appropriate base URLs for different environments
- **Rate limit awareness**: Implement backoff strategies for 429 errors
- **Error handling**: Implement comprehensive error handling for all status codes
- **Idempotency**: Design POST operations to be idempotent when possible
- **Security**: Never log or expose API keys in client-side code
- **Validation**: Validate all input parameters and provide clear error messages
- **User-Agent**: Always include properly formatted User-Agent header
- **Request logging**: Filter sensitive data when logging HTTP requests and responses
- **Timeout handling**: Set appropriate timeouts and implement retry strategies

### Service Design Patterns
- **Resource naming**: Use plural nouns for collections (`/users`, `/orders`)
- **Nested resources**: Use for related entities (`/users/123/orders`)
- **Action endpoints**: Use for operations that don't fit CRUD (`/users/123/activate`)
- **Consistent responses**: Use same structure across all endpoints
- **Filtering**: Support common filtering patterns with query parameters
