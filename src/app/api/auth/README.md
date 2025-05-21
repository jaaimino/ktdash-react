# Authentication System

This directory contains the API routes for the authentication system. The system is designed to be secure, scalable, and easy to use.

## API Routes

### Session Management (`/api/auth/session`)

- **GET**: Checks if a user is authenticated and returns the user data if they are.
- **POST**: Logs in a user with username and password, creates a session, and sets a cookie.
- **DELETE**: Logs out a user by deleting the session and clearing the cookie.

### User Management (`/api/auth/user`)

- **GET**: Gets a user by username or ID, including their rosters.
- **POST**: Creates a new user with validation for username format, length, uniqueness, and password matching.

## Authentication Flow

1. **Registration**:
   - User submits username, password, and password confirmation
   - System validates the input
   - System creates a new user with a hashed password
   - System returns the user data (excluding sensitive information)

2. **Login**:
   - User submits username and password
   - System validates the credentials
   - System creates a new session and sets a cookie
   - System returns the user data (excluding sensitive information)

3. **Session Validation**:
   - System checks if the session cookie exists
   - System validates the session in the database
   - System updates the session's last activity time
   - System returns the user data (excluding sensitive information)

4. **Logout**:
   - System deletes the session from the database
   - System clears the session cookie

## Security Considerations

- Passwords are hashed using bcrypt
- Session IDs are random and unique
- Cookies are HTTP-only, secure (in production), and have a strict SameSite policy
- Input validation is performed on all endpoints
- Error messages are generic to prevent information leakage

## Client-Side Usage

The authentication system is used through the `useAuth` hook in `src/hooks/use-auth/index.jsx`. This hook provides:

- `user`: The current user data
- `loading`: Whether an authentication operation is in progress
- `error`: Any error that occurred during an authentication operation
- `isLoggedIn`: A function that returns whether the user is logged in
- `login`: A function to log in a user
- `logout`: A function to log out a user
- `signup`: A function to register a new user
- `setupSession`: A function to check if the user is authenticated

Example usage:

```jsx
import useAuth from '@/hooks/use-auth';

function MyComponent() {
  const { user, loading, error, login, logout, signup, isLoggedIn } = useAuth();

  const handleLogin = async (username, password) => {
    const result = await login(username, password);
    if (result.error) {
      // Handle error
    } else {
      // Handle success
    }
  };

  return (
    <div>
      {isLoggedIn() ? (
        <div>
          <p>Welcome, {user.username}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Please log in</p>
          <button onClick={() => handleLogin('username', 'password')}>Login</button>
        </div>
      )}
    </div>
  );
}
```

## Database Schema

The authentication system uses two tables in the database:

- `User`: Stores user information
  - `userid`: A unique identifier for the user
  - `username`: The user's username
  - `passhash`: The user's hashed password
  - `createddate`: The date the user was created

- `Session`: Stores session information
  - `sessionid`: A unique identifier for the session
  - `userid`: The user the session belongs to
  - `lastactivity`: The last time the session was used