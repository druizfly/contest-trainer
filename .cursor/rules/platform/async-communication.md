# Async Communication Rules

Event-driven architecture requires standardized message formats to ensure effective communication between services. Standardization provides:
  - Interoperability: Services can exchange events or commands seamlessly regardless of technology stack
  - Loose Coupling: Clear contracts between components without tight dependencies
  - Scalability: Consistent processing across multiple service instances. Handling eventual consistency
  - Evolution: Schema changes without breaking existing integrations

Flywire defines two message types with standardized formats

## Message Types

### Domain Events
- **Purpose**: Inform other services that business changes have occurred
- **Naming**: Past tense (e.g., `user.created`, `payment.processed`)
- **Format**: `{organization}.{service}.{version}.event.{entity}.{past_action}`
- **Example**: `com.flywire.flywire-core.1-0.event.booking.initiated`

### Commands
- **Purpose**: Request other services to perform a task
- **Naming**: Imperative (e.g., `user.create`, `payment.process`)
- **Format**: `{organization}.{service}.{version}.command.{entity}.{action}`
- **Example**: `com.flywire.health.1-0.command.payment_plan.create_plan`

## Event Message Schema

```json
{
  "occurred_on": "2020-02-09T13:09:00.765123456Z",
  "id": "a0558f6b-6971-4842-b310-a9bc92e75820",
  "name": "com.flywire.service.1-0.event.entity.action",
  "data": { /* event-specific data */ },
  "metadata": {
    "version": "1.0",
    "application": "service_name",
    "partition_id": "entity.id",
    "published_at": "2020-02-09T13:10:00.765123456Z",
    "correlation_id": "correlation-uuid",
    "entity": { /* entity snapshot */ },
    "entity_version": "12",
    "entity_snapshot_on": "2020-02-09T13:09:00.765123456Z"
  }
}
```

## Command Message Schema

```json
{
  "occurred_on": "2020-02-09T13:09:00.765123456Z",
  "id": "command-uuid",
  "name": "com.flywire.service.1-0.command.entity.action",
  "data": {
    "command_id": "required-command-id",
    /* command data */
  },
  "metadata": {
    "response_routing_key": "/service/response-path",
    "version": "1.0",
    "application": "service_name"
  }
}
```

## Versioning Rules

### Version Format
- **Major.Minor**: `1-0`, `1-1`, `2-0`
- **Major**: Breaking changes (rename/remove fields, add enum values, change field types...)
- **Minor**: Non-breaking additions

### Producer Rules
- **MUST** publish only latest minor version
- **MUST** publish different major versions simultaneously

### Consumer Rules
- **SHOULD** accept only one major version
- **MUST** accept all minor versions of chosen major
- **MUST** handle new fields gracefully in minor versions
- **MUST NOT** use the same queue name in 2 different applications or use cases

## AMQP Implementation

### Exchange Naming
```
{environment}/ex/{owner_identifier}/{type}
```
Example: `local/ex/com.flywire.flywire-core/main`

### Queue Naming
```
{environment}/qu/{subscriber_app}/{subscriber_name}/{owner_identifier}
```
Example: `production/qu/flywire-core/case_received.receive_transfer/com.flywire.matching`

### Routing Key
- filters the messages received in a queue
```
{owner_identifier}.{event_version}.event.{entity}.{action}
```
Example: `com.flywire.flywire-core.1-0.event.booking.#`


## Documentation Standards

### AsyncAPI
- Create `asyncapi.json` in docs/async_api folder in your repository. Create one file per entity. For example `payments.json`
- Register in api-docs.flywire.com
  - [Api Docs Repository](https://gitlab.flywire.tech/flywire/development/api-docs) - GitLab Project ID: 193

### Required Fields

| Field        | Type     | Required | Description                              |
|--------------|----------|----------|------------------------------------------|
| `occurred_on`| string   | Yes      | UTC ISO-8601 Zulu Time with nanoseconds  |
| `id`         | UUID4    | Yes      | Unique identifier of the message         |
| `name`       | string   | Yes      | Follows async API format                 |
| `data`       | object   | Yes      | Event or command specific payload        |
| `metadata`   | object   | Yes      | Metadata associated to the event         |

### Optional Metadata
- **partition_id**: For ordered processing
- **correlation_id**: For tracing across services
- **tags**: For testing/categorization
- **replay_id**: For event replay scenarios
- **entity**
- **entity_snapshot_on**
- **entity_version**

### ✅ Good Event Name
`com.flywire.flywire-core.1-0.event.booking.created`

### ❌ Bad Event Name
`booking.event.core.1-0.created.flywire`

### Data types

- Use proper field formats:
  - ISO-8601 Zulu Time for dates. With milliseconds or nanoseconds if required
  - Structured money format for amounts. Specify the currency, specify the subunit to unit

### Dates Format
```json
{
  "stored_at": "2023-05-24T07:52:10Z",
  "published_at": "2023-05-24T07:53:24.939Z",
  "created_at": "2023-05-24T07:53:24.360036586Z"
}
```

Ruby example with nanoseconds:
```ruby
{ created_at: Time.now.utc.iso8601(9) }
```

#### Money Format
```json
{
  "amount": {
    "value": 1234567,
    "currency": {
      "code": "USD",
      "subunit_to_unit": 100
    }
  }
}
```

## Event Design

Flywire events must provide a Completeness Guarantee: consumers listening to the entire event stream should be able to faithfully reproduce the producer's state over time.
- Specs:
  - Every meaningful business domain change should emit an event
  - Events must contain all affected information
  - Include only changed attributes (lean events)
  - Producers may enrich events with additional relevant data beyond just the changed attributes to:
    - Reduce consumer complexity
    - Minimize the need to reconstruct state across multiple events
    - Enable autonomous consumer decision-making
    - Entity Snapshots are recommended for such cases
    - Balance: Maintain completeness while providing practical enrichment for consumer convenience.

### Entity Snapshots

> **Important:** Entity snapshots are **optional** and should only be included when **consumers explicitly require the full entity** at the moment the event occurred.

#### Guidelines
- Include full entity snapshot in `metadata.entity`
- Snapshot at event occurrence time
- Include entity version and timestamp
- Follow aggregate boundaries

## Error Handling

Both producers and consumers MUST implement resilient error handling for message delivery issues, network delays, and processing failures.

### Consumer Requirements

- Idempotency (REQUIRED)
  - Rule: Process each message exactly once, even if delivered multiple times
  - Potential Implementation: Use message id  or entity id and event to track processed messages
  - Critical: Never perform duplicate side effects (emails, payments, API calls)

- Failure Logging (REQUIRED)
  - What to log: All processing failures with full context
  - Required fields: message id, name, correlation_id, entity id, non PII fields, error details
  - Purpose: Enable debugging and observability

- Recommended Patterns. Choose ONE strategy based on your service needs:
  - Dead Letter Queues (DLQ)
      - One DLQ exchange per application
      - TTL-based automatic reprocessing
      - Track retry attempts with queued_times counter
      - Maintain correlation_id for tracing

  - Inbox Pattern
      - Store incoming messages before processing
      - Mark as processed after successful handling
      - Built-in duplicate detection

  - Failover Pattern
      - Persist failed events for manual reprocessing
      - Include full context for debugging

  - Backoff Strategy
      - Exponential backoff for retries
      - Reduces system load during outages

### Producer Requirements

- Delivery Guarantee (REQUIRED)
  - Rule: Ensure messages published at least once
  - Failure handling: Store, retry, or log failed publications
  - Never lose: Business-critical events must not be lost

- Failure Logging (REQUIRED)
  - What to log: All publication failures with context
  - Required fields: message.id, name, correlation_id, error details

- Recommended Patterns. Choose based on consistency requirements:
  - Outbox Pattern
      - Store events in same transaction as business changes
      - Separate process publishes from outbox
      - Guarantees eventual consistency

  - Background Job Retries
      - Queue publication as background job
      - Built-in retry mechanisms
      - Monitor job failure rates

## OpenTelemetry Integration

### Span Operations
- **publish**: Publishing messages
- **receive**: Consuming messages

### Required Attributes
- `messaging.system`: "rabbitmq"
- `messaging.operation`: "publish"/"receive"
- `messaging.message.id`: Event UUID
- `messaging.message.event.name`: Full event name
- `messaging.destination.name`: Exchange/queue name

## Technology Stack
- **Ruby**
    - **Recommended**: Fly-Pub-Sub gem with AMQP adapter
      - [Fly-Pub-Sub gem](https://gitlab.flywire.tech/flywire/development/gems/fly-pub-sub) - GitLab Project ID: 555
      - [Fly-Pub-Sub AMQP adapter](https://gitlab.flywire.tech/flywire/development/gems/fly-pub-sub-amqp) - GitLab Project ID: 556
      - [Fly-Pub-Sub AMQP OpenTelemetry instrumentation](https://gitlab.flywire.tech/flywire/development/gems/dev-flotel/flotel/-/tree/master/instrumentation/fly-pub-sub-amqp?ref_type=heads) - Gitlab Project ID: 1427
    - **Alternative**: Bunny gem with RabbitMQ
- **Analytics**: Bridge events via Events Forwarder in [Tracker service](https://gitlab.flywire.tech/flywire/development/tracker) for communication to analytics platform
