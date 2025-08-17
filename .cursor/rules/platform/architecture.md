# Backend Architecture Rules

## Core Architectural Principles

### 1. **Isolate Use Cases**
Each use case (e.g., `CreatePayment`) should be implemented in a single service class.
- Don't call one service from another
- Keep business logic isolated
- Each service handles one specific business operation

### 2. **Separate Concerns**
Split responsibilities between layers:
- `Application Services` → business logic and orchestration
- `Domain Models` → state, behavior, and business rules
- `Repositories` → persistence and data retrieval
- `Gateways` → external API communication
- `Query Handlers` → complex read operations

### 3. **Prioritize Explicitness**
- Favor clarity over premature abstraction
- Duplication is acceptable if it improves understanding
- Make code intentions obvious
- Avoid clever solutions that obscure meaning

### 4. **Domain-Centric Design**
- Keep domain logic inside domain models
- State changes (`reject!`, `approve!`) belong in domain objects
- Domain models should not depend on infrastructure
- Use rich domain models, not anemic ones

### 5. **Clean Boundaries**
- Gateways only wrap external systems (no business logic)
- Repositories only persist and retrieve domain objects
- Controllers handle HTTP concerns only
- Services orchestrate but don't implement domain logic

### 6. **Error Handling Strategy**
- Return `Success()` / `Failure()` from services
- Use monads (like `dry-monads`) for flow control
- Avoid exceptions as regular control flow
- Make error cases explicit and handleable

### 7. **Input Validation**
- Validate at system boundaries
- Use contracts (`dry-validation`) for complex validation
- Fail fast with clear error messages
- Separate validation from business logic

### 8. **Command Pattern**
- Use command objects for complex inputs
- Encapsulate operation parameters
- For simple inputs, keyword arguments are acceptable
- Commands should be immutable

## Testing Architecture

### 9. **Test-First Development**
- Write behavior/integration tests first
- Tests drive architecture decisions
- Each use case needs full integration tests
- Focus on testing behavior, not implementation

### 10. **Test Pyramid**
- **Integration Tests**: Full-stack tests for each use case
- **Unit Tests**: Only for complex logic and edge cases
- **Contract Tests**: For external service boundaries
- Avoid over-testing simple delegations

## Event-Driven Architecture

### 11. **Async Communication**
- Only read @async-communication.md when needed changes related to events, asynchronous communication or event-driven architecture

## API Design
- Only read @sync-communication.md when needed changes related to apis or sync communication between services

### 12. **API Documentation**
- Only read @open_api_guidelines.md when creating or modifying OpenAPI specifications
