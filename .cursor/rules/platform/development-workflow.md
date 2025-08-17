# Development Workflow

## Git Workflow

### Branch Strategy
- **Main branch**: `master` (production-ready code)
- **Feature branches**: `JIRA-XXXX`

### Branch Naming Convention
```
JIRA-XXXX
Examples:
- PAAR-1234
- PAGE-5678
```

### Commit Guidelines
1. Use imperative mood: "Add feature" not "Added feature"
2. Keep commits atomic and focused
3. Reference JIRA ticket or the git branch in commit message
4. Use conventional commits when applicable:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `refactor:` code refactoring
   - `test:` test additions/changes
   - `chore:` maintenance tasks

## Test-Driven Development (TDD)
TEST-DRIVEN DEVELOPMENT IS NON-NEGOTIABLE. Every single line of production code must be written in response to a failing test. No exceptions. This is not a suggestion or a preference - it is the fundamental practice that enables all other principles in this document.

### The TDD Cycle
1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

### TDD Workflow
```bash
# 1. Write failing test
make test test=test_name  # Verify it fails

# 2. Implement minimal code
# Edit source files

# 3. Run tests again
make test test=test_name  # Should pass

# 4. Refactor if needed
make lint      # Check code style
make test  # Ensure nothing broke
```

### Testing Best Practices
- Test behavior, not implementation
- One assertion per test when possible
- Use descriptive test names
- Arrange-Act-Assert pattern
- Keep tests independent
- Mock external dependencies

## Development Environment

### Docker-First Approach
All projects use Docker for consistency:
```bash
make up        # Start services
make down      # Stop services
make console   # Access container shell
make logs      # View container logs
make test      # Execute tests in container
```

### Makefile Commands
Every project includes a Makefile with standard commands:
- `make test-unit` - Run unit tests
- `make test-integration` - Run integration tests
- `make test-all` - Run all tests
- `make lint` - Check code style
- `make format` - Auto-format code
- `make build` - Build application
- `make clean` - Clean build artifacts

## Code Review Process

### Pre-Merge Requirements
1. All tests must pass
2. Code coverage maintained or improved
3. Linting checks pass
4. Documentation updated
5. JIRA ticket linked
6. At least one/two approval

### Review Checklist
- [ ] Code follows architecture rules
- [ ] Tests cover new functionality
- [ ] No security vulnerabilities
- [ ] Performance implications considered
- [ ] Error handling is appropriate
- [ ] Documentation is clear

## Documentation

### Code Documentation
- Do not comment the code unless the comment was already present
- Self-documenting code preferred
- Keep README files updated
- Document architectural decisions

### API Documentation
- OpenAPI/Swagger for REST APIs
- AsyncAPI for event-driven APIs
- Include request/response examples
- Document error scenarios
