# Authentication Testing

This directory contains tests for the authentication system. The tests are organized by API route and component, and they use Jest and React Testing Library.

## Test Structure

The tests are organized as follows:

- `src/hooks/use-auth/__tests__/use-auth.test.jsx`: Tests for the `useAuth` hook
- `src/app/api/auth/session/__tests__/route.test.js`: Tests for the session API route
- `src/app/api/auth/user/__tests__/route.test.js`: Tests for the user API route

## Running Tests

To run the tests, use the following commands:

- `npm test`: Run all tests
- `npm run test:watch`: Run tests in watch mode (useful during development)
- `npm run test:coverage`: Run tests and generate a coverage report

## Testing Approach

### Hook Testing

The `useAuth` hook is tested using React Testing Library's `renderHook` function. The tests mock the dependencies (fetch API, useLocalStorage) and test the hook's behavior in various scenarios:

- Authentication state management
- API calls for login, signup, logout, and session validation
- Error handling

### API Route Testing

The API routes are tested by mocking their dependencies (Prisma, bcrypt, crypto, Next.js cookies and headers) and testing their behavior in various scenarios:

- Input validation
- Database interactions
- Error handling
- Response formatting

## Mocking Strategy

The tests use Jest's mocking capabilities to isolate the components and API routes from their dependencies:

- `fetch`: Mocked globally to test API calls without making actual network requests
- `@mantine/hooks`: Mocked to control the behavior of the `useLocalStorage` hook
- `@prisma/client`: Mocked to test database interactions without an actual database
- `bcrypt`: Mocked to avoid actual password hashing during tests
- `crypto`: Mocked to provide predictable random values
- `next/headers` and `next/server`: Mocked to test Next.js-specific functionality

## Coverage Goals

The tests aim to achieve at least 70% code coverage for:

- Statements
- Branches
- Functions
- Lines

This ensures that the authentication system is thoroughly tested and that most edge cases are covered.

## Best Practices

When writing tests for the authentication system, follow these best practices:

1. **Isolate tests**: Each test should be independent and not rely on the state from other tests
2. **Mock dependencies**: Use Jest's mocking capabilities to isolate the code being tested
3. **Test edge cases**: Test both the happy path and error cases
4. **Clear mocks between tests**: Use `beforeEach` to reset mocks between tests
5. **Use descriptive test names**: Test names should describe what is being tested and the expected outcome
6. **Avoid testing implementation details**: Test the behavior, not the implementation
7. **Keep tests simple**: Each test should test one thing only
8. **Maintain test coverage**: Ensure that new code is covered by tests