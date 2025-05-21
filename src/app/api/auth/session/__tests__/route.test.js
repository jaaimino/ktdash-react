import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { GET, POST, DELETE } from '../route';

// Mock dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    session: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

jest.mock('next/server', () => {
  const mockSet = jest.fn();
  const mockResponse = {
    cookies: {
      set: mockSet
    }
  };

  return {
    NextResponse: {
      json: jest.fn((data, options) => {
        // Return the response object with the data and options
        return {
          ...mockResponse,
          ...data
        };
      }),
    },
  };
});

describe('Session API Route', () => {
  let mockPrisma;
  let mockCookieStore;
  let mockCookie;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup Prisma mock
    mockPrisma = new PrismaClient();

    // Ensure delete returns a promise with a catch method
    mockPrisma.session.delete.mockImplementation(() => Promise.resolve());

    // Setup cookie mock
    mockCookie = {
      name: 'asid',
      value: 'session123|user456',
    };

    mockCookieStore = {
      get: jest.fn().mockReturnValue(mockCookie),
      set: jest.fn(),
    };

    cookies.mockReturnValue(mockCookieStore);

    // Setup crypto mock
    crypto.randomBytes.mockReturnValue({
      toString: jest.fn().mockReturnValue('randomsessionid'),
    });
  });

  describe('GET', () => {
    test('returns 401 when no session cookie exists', async () => {
      mockCookieStore.get.mockReturnValueOnce(undefined);

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Not logged in' },
        { status: 401 }
      );
    });

    test('returns 401 when session cookie has no value', async () => {
      mockCookieStore.get.mockReturnValueOnce({ name: 'asid', value: '' });

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Not logged in' },
        { status: 401 }
      );
    });

    test('returns 401 when session cookie has invalid format', async () => {
      mockCookieStore.get.mockReturnValueOnce({ name: 'asid', value: 'invalid' });

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid session' },
        { status: 401 }
      );
    });

    test('returns 401 when session not found in database', async () => {
      mockPrisma.session.findUnique.mockResolvedValueOnce(null);

      await GET();

      expect(mockPrisma.session.findUnique).toHaveBeenCalledWith({
        where: { sessionid: 'session123' },
        include: { User: true }
      });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid session' },
        { status: 401 }
      );
    });

    test('returns 401 when session user ID does not match cookie user ID', async () => {
      mockPrisma.session.findUnique.mockResolvedValueOnce({
        sessionid: 'session123',
        userid: 'differentuser',
        User: {
          userid: 'differentuser',
          username: 'testuser',
          passhash: 'hashedpassword',
        }
      });

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid session' },
        { status: 401 }
      );
    });

    test('returns user data when session is valid', async () => {
      const mockUser = {
        userid: 'user456',
        username: 'testuser',
        passhash: 'hashedpassword',
        createddate: new Date(),
      };

      mockPrisma.session.findUnique.mockResolvedValueOnce({
        sessionid: 'session123',
        userid: 'user456',
        User: mockUser,
      });

      await GET();

      expect(mockPrisma.session.update).toHaveBeenCalled();

      const { passhash, ...userData } = mockUser;
      expect(NextResponse.json).toHaveBeenCalledWith(userData);
    });

    test('handles database errors', async () => {
      // Mock console.error to prevent it from cluttering the test output
      jest.spyOn(console, 'error').mockImplementation(() => {});

      mockPrisma.session.findUnique.mockRejectedValueOnce(new Error('Database error'));

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Server error' },
        { status: 500 }
      );

      // Restore console.error
      console.error.mockRestore();
    });
  });

  describe('POST', () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        username: 'testuser',
        password: 'password123',
      }),
    };

    test('returns 400 when username or password is missing', async () => {
      mockRequest.json.mockResolvedValueOnce({});

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    });

    test('returns 400 when username or password is too long', async () => {
      mockRequest.json.mockResolvedValueOnce({
        username: 'a'.repeat(51),
        password: 'password123',
      });

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid input' },
        { status: 400 }
      );
    });

    test('returns 401 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await POST(mockRequest);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    });

    test('returns 401 when password is incorrect', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        userid: 'user456',
        username: 'testuser',
        passhash: 'hashedpassword',
      });

      bcrypt.compare.mockResolvedValueOnce(false);

      await POST(mockRequest);

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    });

    test('creates session and returns user data when credentials are valid', async () => {
      const mockUser = {
        userid: 'user456',
        username: 'testuser',
        passhash: 'hashedpassword',
        createddate: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);

      await POST(mockRequest);

      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: {
          sessionid: 'randomsessionid',
          userid: 'user456',
          lastactivity: expect.any(Date),
        }
      });

      const { passhash, ...userData } = mockUser;
      expect(NextResponse.json).toHaveBeenCalledWith(userData);

      // Check that the response has a cookie set
      expect(NextResponse.json().cookies.set).toHaveBeenCalled();
    });

    test('handles database errors', async () => {
      // Mock console.error to prevent it from cluttering the test output
      jest.spyOn(console, 'error').mockImplementation(() => {});

      mockPrisma.user.findUnique.mockRejectedValueOnce(new Error('Database error'));

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Server error' },
        { status: 500 }
      );

      // Restore console.error
      console.error.mockRestore();
    });
  });

  describe('DELETE', () => {
    test('deletes session and clears cookie when session exists', async () => {
      await DELETE();

      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { sessionid: 'session123' }
      });

      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });

      // Check that the response has a cookie cleared
      expect(NextResponse.json().cookies.set).toHaveBeenCalled();
    });

    test('returns success even when no session cookie exists', async () => {
      mockCookieStore.get.mockReturnValueOnce(undefined);

      await DELETE();

      expect(mockPrisma.session.delete).not.toHaveBeenCalled();

      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });

      // Check that the response still has a cookie cleared
      expect(NextResponse.json().cookies.set).toHaveBeenCalled();
    });

    test('ignores database errors when deleting session', async () => {
      // Mock console.error to prevent it from cluttering the test output
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock session.delete to reject with an error
      mockPrisma.session.delete.mockImplementationOnce(() => 
        Promise.reject(new Error('Database error'))
      );

      await DELETE();

      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });

      // Restore console.error
      console.error.mockRestore();
    });

    test('handles unexpected errors', async () => {
      // Mock console.error to prevent it from cluttering the test output
      jest.spyOn(console, 'error').mockImplementation(() => {});

      cookies.mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      await DELETE();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Server error' },
        { status: 500 }
      );

      // Restore console.error
      console.error.mockRestore();
    });
  });
});
