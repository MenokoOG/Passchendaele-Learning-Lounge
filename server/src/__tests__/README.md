# Testing Guide

This directory contains the test infrastructure for the server application.

## Test Structure

```
src/__tests__/
├── utils/          # Unit tests for utility functions
│   ├── auth.test.ts
│   └── helpers.test.ts
└── routes/         # E2E/Integration tests for API routes
    └── auth.test.ts
```

## Running Tests

### Install Dependencies

First, ensure all test dependencies are installed:

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Test Types

### Unit Tests

Unit tests are located in `__tests__/utils/` and test individual utility functions in isolation.

Example:
- `auth.test.ts` - Tests for password hashing and JWT token creation/verification
- `helpers.test.ts` - Tests for request helper functions

### E2E/Integration Tests

E2E tests are located in `__tests__/routes/` and test complete API endpoints including database operations.

Example:
- `auth.test.ts` - Tests for authentication routes (register, login, me)

## Test Environment

### Environment Variables

Set these environment variables for testing:

```bash
NODE_ENV=test
TEST_MONGO_URI=mongodb://localhost:27017/test-db  # Or use mongodb-memory-server
JWT_SECRET=test-secret-key-min-16-chars
```

### Database Setup

E2E tests require a MongoDB instance. You have two options:

1. **Use a local MongoDB instance:**
   ```bash
   # Start MongoDB
   mongod --dbpath /path/to/test/db
   
   # Set environment variable
   export TEST_MONGO_URI=mongodb://localhost:27017/test-db
   ```

2. **Use mongodb-memory-server (recommended):**
   ```bash
   npm install -D mongodb-memory-server
   ```
   
   Then configure it in your test setup file.

## Writing Tests

### Unit Test Example

```typescript
import { hashPassword, comparePassword } from "../../utils/auth.js";

describe("auth utils", () => {
  it("should hash and verify password", async () => {
    const password = "test123";
    const hash = await hashPassword(password);
    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
  });
});
```

### E2E Test Example

```typescript
import request from "supertest";
import app from "../../app.js";

describe("POST /api/auth/login", () => {
  it("should login successfully", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        emailOrUsername: "test@example.com",
        password: "password123",
      })
      .expect(200);

    expect(response.body.token).toBeDefined();
  });
});
```

## Best Practices

1. **Isolate tests**: Each test should be independent and not rely on others
2. **Clean up**: Use `afterEach` to clean up test data
3. **Mock external dependencies**: Mock third-party APIs and services
4. **Test edge cases**: Include tests for error conditions and edge cases
5. **Use descriptive names**: Test names should clearly describe what they test
6. **Follow AAA pattern**: Arrange, Act, Assert

## Coverage Goals

Aim for:
- **Unit tests**: 80%+ coverage for utility functions
- **Integration tests**: Cover all critical API endpoints
- **E2E tests**: Cover main user workflows

## Troubleshooting

### Tests hanging or timing out

- Check that MongoDB connection is properly closed in `afterAll`
- Increase test timeout in jest.config.cjs
- Use `--detectOpenHandles` flag to find open handles

### JWT_SECRET errors

- Ensure JWT_SECRET is set and is at least 16 characters
- Check that environment variables are loaded correctly

### Database connection errors

- Verify MongoDB is running
- Check TEST_MONGO_URI is correctly set
- Ensure test database has proper permissions

## Future Improvements

- [ ] Add mongodb-memory-server for isolated testing
- [ ] Add test fixtures and factories for test data
- [ ] Add API mocking for external services (OpenAI, etc.)
- [ ] Add performance tests
- [ ] Add load tests
- [ ] Set up CI/CD pipeline integration
- [ ] Add test coverage reporting to GitHub Actions
