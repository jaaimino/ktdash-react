# KTDash Testing Documentation

This directory contains test utilities and configuration files for the KTDash project. The project uses Jest and React Testing Library for testing.

## Testing Setup

The testing setup includes:

1. **Jest Configuration**: `jest.config.js` at the project root configures Jest for testing Next.js applications.
2. **Jest Setup**: `jest.setup.js` at the project root sets up the testing environment, including mocks for common dependencies.
3. **Test Scripts**: The `package.json` file includes scripts for running tests:
   - `npm test`: Run all tests
   - `npm run test:watch`: Run tests in watch mode
   - `npm run test:coverage`: Run tests and generate a coverage report

## Test Organization

Tests are organized following the same structure as the source code:

- **Component Tests**: Located in `__tests__` directories next to the components they test
- **Hook Tests**: Located in `__tests__` directories next to the hooks they test
- **API Route Tests**: Located in `__tests__` directories next to the API routes they test

## Authentication Testing

The authentication system has been thoroughly tested:

- **useAuth Hook**: Tests for the authentication hook that manages user state and provides authentication methods
- **Session API**: Tests for the session management API that handles login, logout, and session validation
- **User API**: Tests for the user management API that handles user creation and retrieval

For more details on authentication testing, see `src/app/api/auth/__tests__/README.md`.

## Coverage Requirements

The project aims for at least 70% code coverage across:

- Statements
- Branches
- Functions
- Lines

## Adding New Tests

When adding new features or modifying existing ones, follow these guidelines:

1. Create tests in an `__tests__` directory next to the code being tested
2. Use descriptive test names that explain what is being tested and the expected outcome
3. Mock external dependencies to isolate the code being tested
4. Test both success and error cases
5. Maintain or improve code coverage

## Running Tests in CI/CD

The tests are configured to run in CI/CD pipelines. The Jest configuration includes settings for generating coverage reports that can be used by CI/CD tools to track code coverage over time.