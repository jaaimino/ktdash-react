import { renderHook, act } from '@testing-library/react';
import useAuth from '../index';
import { useLocalStorage } from '@mantine/hooks';

// Mock the useLocalStorage hook
jest.mock('@mantine/hooks', () => ({
  useLocalStorage: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('useAuth hook', () => {
  // Mock storage setter function
  const setUser = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Reset fetch mock
    global.fetch.mockReset();

    // Setup useLocalStorage mock
    useLocalStorage.mockReturnValue([undefined, setUser]);

    // Setup fetch mock default
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
  });

  test('isLoggedIn returns false when user is not defined', async () => {
    useLocalStorage.mockReturnValue([undefined, setUser]);

    let result;
    await act(async () => {
      result = renderHook(() => useAuth()).result;
    });

    expect(result.current.isLoggedIn()).toBe(false);
  });

  test('isLoggedIn returns false when user has no userid', async () => {
    useLocalStorage.mockReturnValue([{ name: 'Test User' }, setUser]);

    let result;
    await act(async () => {
      result = renderHook(() => useAuth()).result;
    });

    expect(result.current.isLoggedIn()).toBe(false);
  });

  test('isLoggedIn returns true when user has userid', async () => {
    useLocalStorage.mockReturnValue([{ userid: '123', name: 'Test User' }, setUser]);

    let result;
    await act(async () => {
      result = renderHook(() => useAuth()).result;
    });

    expect(result.current.isLoggedIn()).toBe(true);
  });

  test('setupSession sets user when response is ok', async () => {
    const mockUser = { userid: '123', username: 'testuser' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    let result;
    await act(async () => {
      result = renderHook(() => useAuth()).result;
    });

    await act(async () => {
      await result.current.setupSession();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });
    expect(setUser).toHaveBeenCalledWith(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('setupSession clears user when response is not ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    let result;
    await act(async () => {
      result = renderHook(() => useAuth()).result;
    });

    await act(async () => {
      await result.current.setupSession();
    });

    expect(setUser).toHaveBeenCalledWith(undefined);
    expect(result.current.loading).toBe(false);
  });

  test('setupSession handles errors', async () => {
    // Create a new instance of the hook for this test
    const { result } = renderHook(() => useAuth());

    // Mock fetch to reject with an error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    // Mock console.error to prevent it from cluttering the test output
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Call setupSession
    await act(async () => {
      await result.current.setupSession();
    });

    // Verify the expected behavior
    expect(setUser).toHaveBeenCalledWith(undefined);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to set up session');

    // Restore console.error
    console.error.mockRestore();
  });

  test('login sets user when response is ok', async () => {
    const mockUser = { userid: '123', username: 'testuser' };

    // Create the hook instance first
    const { result } = renderHook(() => useAuth());

    // Clear any previous mock implementations
    global.fetch.mockReset();
    setUser.mockClear();

    // Set up the mock for the fetch call
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser)
      })
    );

    // Call login
    let returnValue;
    await act(async () => {
      returnValue = await result.current.login('testuser', 'password');
    });

    // Verify the expected behavior
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password',
      }),
    });
    expect(setUser).toHaveBeenCalledWith(mockUser);
    expect(returnValue).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('login handles error response', async () => {
    const errorResponse = { error: 'Invalid credentials' };

    // Create the hook instance first
    const { result } = renderHook(() => useAuth());

    // Clear any previous mock implementations
    global.fetch.mockReset();
    setUser.mockClear();

    // Set up the mock for the fetch call
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve(errorResponse)
      })
    );

    // Call login
    let returnValue;
    await act(async () => {
      returnValue = await result.current.login('testuser', 'password');
    });

    // Verify the expected behavior
    expect(returnValue).toEqual(errorResponse);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  test('login handles fetch errors', async () => {
    // Create the hook instance first
    const { result } = renderHook(() => useAuth());

    // Clear any previous mock implementations
    global.fetch.mockReset();
    setUser.mockClear();

    // Mock console.error to prevent it from cluttering the test output
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Set up the mock for the fetch call
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    // Call login
    let returnValue;
    await act(async () => {
      returnValue = await result.current.login('testuser', 'password');
    });

    // Verify the expected behavior
    expect(returnValue).toEqual({ error: 'Login failed' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Login failed');

    // Restore console.error
    console.error.mockRestore();
  });

  test('signup creates user and logs in when successful', async () => {
    const mockUser = { userid: '123', username: 'testuser' };

    // Create the hook instance first
    const { result } = renderHook(() => useAuth());

    // Clear any previous mock implementations
    global.fetch.mockReset();
    setUser.mockClear();

    // Set up the mocks for both fetch calls
    global.fetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })
      );

    // Call the signup function
    let returnValue;
    await act(async () => {
      returnValue = await result.current.signup('testuser', 'password', 'password');
    });

    // Check user creation request
    expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/auth/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password',
        confirmpassword: 'password',
      }),
    });

    // Check login request
    expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/auth/session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password',
      }),
    });

    expect(setUser).toHaveBeenCalledWith(mockUser);
    expect(returnValue).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('signup handles user creation error', async () => {
    const errorResponse = { error: 'Username already taken' };

    // Create the hook instance first
    const { result } = renderHook(() => useAuth());

    // Clear any previous mock implementations
    global.fetch.mockReset();
    setUser.mockClear();

    // Set up the mock for the fetch call
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve(errorResponse)
      })
    );

    // Call the signup function
    let returnValue;
    await act(async () => {
      returnValue = await result.current.signup('testuser', 'password', 'password');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(returnValue).toEqual(errorResponse);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Username already taken');
  });

  test('logout clears user and session', async () => {
    // Create the hook instance first
    const { result } = renderHook(() => useAuth());

    // Clear any previous mock implementations
    global.fetch.mockReset();
    setUser.mockClear();

    // Set up the mock for the fetch call
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );

    // Call the logout function
    await act(async () => {
      await result.current.logout();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', {
      method: 'DELETE',
      credentials: 'include',
    });
    expect(setUser).toHaveBeenCalledWith(undefined);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('logout clears user even when fetch fails', async () => {
    // Create the hook instance first
    const { result } = renderHook(() => useAuth());

    // Clear any previous mock implementations
    global.fetch.mockReset();
    setUser.mockClear();

    // Mock console.error to prevent it from cluttering the test output
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Set up the mock for the fetch call
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    // Call the logout function
    await act(async () => {
      await result.current.logout();
    });

    expect(setUser).toHaveBeenCalledWith(undefined);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Logout failed');

    // Restore console.error
    console.error.mockRestore();
  });

  test('useEffect calls setupSession when user is not defined', async () => {
    // Clear any previous mock implementations
    global.fetch.mockReset();
    setUser.mockClear();

    // Setup the mock for this test
    useLocalStorage.mockReturnValue([undefined, setUser]);

    // Setup fetch mock to return a successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({}),
    });

    await act(async () => {
      renderHook(() => useAuth());
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });
  });

  test('useEffect does not call setupSession when user is defined', async () => {
    // Clear any previous mock implementations
    global.fetch.mockReset();
    setUser.mockClear();

    // Setup the mock for this test
    useLocalStorage.mockReturnValue([{ userid: '123' }, setUser]);

    await act(async () => {
      renderHook(() => useAuth());
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
