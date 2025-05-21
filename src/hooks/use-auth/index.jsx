'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@mantine/hooks';

/**
 * Custom hook for authentication
 * @returns {Object} Authentication methods and state
 */
export default function useAuth() {
    const [user, setUser] = useLocalStorage({ key: 'auth' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Checks if the user is logged in
     * @returns {boolean} Whether the user is logged in
     */
    const isLoggedIn = useCallback(() => {
        return !!user?.userid;
    }, [user]);

    /**
     * Sets up the session by checking if the user is authenticated
     * @returns {Promise<void>}
     */
    const setupSession = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/session', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                // Clear user data if not authenticated
                setUser(undefined);
            }
        } catch (err) {
            console.error('Session setup error:', err);
            setError('Failed to set up session');
            setUser(undefined);
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    /**
     * Logs in a user
     * @param {string} username The username
     * @param {string} password The password
     * @returns {Promise<Object>} The result of the login attempt
     */
    const login = useCallback(async (username, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data);
                return data;
            } else {
                setError(data.error || 'Login failed');
                return data;
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed');
            return { error: 'Login failed' };
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    /**
     * Signs up a new user
     * @param {string} username The username
     * @param {string} password The password
     * @param {string} confirmpassword The password confirmation
     * @returns {Promise<Object>} The result of the signup attempt
     */
    const signup = useCallback(async (username, password, confirmpassword) => {
        setLoading(true);
        setError(null);

        try {
            // Create the user
            const userResponse = await fetch('/api/auth/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    confirmpassword,
                }),
            });

            const userData = await userResponse.json();

            if (!userResponse.ok) {
                setError(userData.error || 'Signup failed');
                return userData;
            }

            // Log in the user
            const loginResponse = await fetch('/api/auth/session', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                setUser(loginData);
                return loginData;
            } else {
                setError(loginData.error || 'Login after signup failed');
                return loginData;
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Signup failed');
            return { error: 'Signup failed' };
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    /**
     * Logs out the user
     * @returns {Promise<Object>} The result of the logout attempt
     */
    const logout = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/session', {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await response.json();

            // Clear user data regardless of response
            setUser(undefined);

            return data;
        } catch (err) {
            console.error('Logout error:', err);
            setError('Logout failed');

            // Still clear user data on error
            setUser(undefined);

            return { error: 'Logout failed' };
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    // Check session on mount
    useEffect(() => {
        if (!user?.userid) {
            setupSession();
        }
    }, [user, setupSession]);

    return {
        user,
        loading,
        error,
        isLoggedIn,
        login,
        logout,
        signup,
        setupSession,
    };
}
