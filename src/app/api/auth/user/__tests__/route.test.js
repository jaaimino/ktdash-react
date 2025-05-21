import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { GET, POST } from '../route';

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({
        ...data,
        passhash: 'hashedpassword',
      })),
      findMany: jest.fn(),
    },
    roster: {
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
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

describe('User API Route', () => {
  let mockPrisma;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup Prisma mock
    mockPrisma = new PrismaClient();

    // Setup crypto mock
    crypto.randomBytes.mockReturnValue({
      toString: jest.fn().mockReturnValue('abcdef1234567890'),
    });

    // Setup bcrypt mock
    bcrypt.hash.mockResolvedValue('hashedpassword');
  });

  describe('POST', () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        username: 'testuser',
        password: 'password123',
        confirmpassword: 'password123',
      }),
    };

    test('returns 400 when fields are missing', async () => {
      mockRequest.json.mockResolvedValueOnce({
        username: 'testuser',
        password: 'password123',
      });

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'All fields are required' },
        { status: 400 }
      );
    });

    test('returns 400 when passwords do not match', async () => {
      mockRequest.json.mockResolvedValueOnce({
        username: 'testuser',
        password: 'password123',
        confirmpassword: 'differentpassword',
      });

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    });

    test('returns 400 when username format is invalid', async () => {
      mockRequest.json.mockResolvedValueOnce({
        username: 'test user',
        password: 'password123',
        confirmpassword: 'password123',
      });

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid username - Only letters, numbers, and underscores allowed' },
        { status: 400 }
      );
    });

    test('returns 400 when username is too short', async () => {
      mockRequest.json.mockResolvedValueOnce({
        username: 'test',
        password: 'password123',
        confirmpassword: 'password123',
      });

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Username must be at least 5 characters' },
        { status: 400 }
      );
    });

    test('returns 400 when username is too long', async () => {
      mockRequest.json.mockResolvedValueOnce({
        username: 'a'.repeat(51),
        password: 'password123',
        confirmpassword: 'password123',
      });

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Username must be at most 50 characters' },
        { status: 400 }
      );
    });

    test('returns 400 when username contains an email address', async () => {
      mockRequest.json.mockResolvedValueOnce({
        username: 'test@example.com',
        password: 'password123',
        confirmpassword: 'password123',
      });

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid username - Only letters, numbers, and underscores allowed' },
        { status: 400 }
      );
    });

    test('returns 400 when username is already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        userid: 'existinguser',
        username: 'testuser',
      });

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Username already taken' },
        { status: 400 }
      );
    });

    test('generates a unique user ID', async () => {
      // First check returns an existing user, second check returns null
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // Username check
        .mockResolvedValueOnce({ userid: 'abcde' }) // First ID check
        .mockResolvedValueOnce(null); // Second ID check

      await POST(mockRequest);

      // Should have called findUnique 3 times
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(3);

      // Should have called randomBytes twice
      expect(crypto.randomBytes).toHaveBeenCalledTimes(2);
    });

    test('creates a new user and returns user data', async () => {
      const mockNewUser = {
        userid: 'abcde',
        username: 'testuser',
        passhash: 'hashedpassword',
        createddate: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValueOnce(mockNewUser);

      await POST(mockRequest);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          userid: 'abcde',
          username: 'testuser',
          passhash: 'hashedpassword',
          createddate: expect.any(Date),
        }
      });

      const { passhash, ...userData } = mockNewUser;
      expect(NextResponse.json).toHaveBeenCalledWith(userData);
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

  describe('GET', () => {
    const createMockRequest = (params) => {
      return {
        url: new URL(`https://example.com/api/auth/user?${new URLSearchParams(params)}`),
      };
    };

    test('returns 400 when neither username nor userid is provided', async () => {
      const request = createMockRequest({});

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Username or userid is required' },
        { status: 400 }
      );
    });

    test('finds user by username when username is provided', async () => {
      const request = createMockRequest({ username: 'testuser' });

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        userid: 'user123',
        username: 'testuser',
        passhash: 'hashedpassword',
      });

      mockPrisma.roster.findMany.mockResolvedValueOnce([]);

      await GET(request);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
    });

    test('finds user by userid when userid is provided', async () => {
      const request = createMockRequest({ userid: 'user123' });

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        userid: 'user123',
        username: 'testuser',
        passhash: 'hashedpassword',
      });

      mockPrisma.roster.findMany.mockResolvedValueOnce([]);

      await GET(request);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userid: 'user123' }
      });
    });

    test('returns 404 when user is not found', async () => {
      const request = createMockRequest({ username: 'nonexistentuser' });

      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'User not found' },
        { status: 404 }
      );
    });

    test('returns user data with rosters when user is found', async () => {
      const request = createMockRequest({ username: 'testuser' });

      const mockUser = {
        userid: 'user123',
        username: 'testuser',
        passhash: 'hashedpassword',
        createddate: new Date(),
      };

      const mockRosters = [
        { rosterid: 'roster1', name: 'Roster 1' },
        { rosterid: 'roster2', name: 'Roster 2' },
      ];

      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrisma.roster.findMany.mockResolvedValueOnce(mockRosters);

      await GET(request);

      expect(mockPrisma.roster.findMany).toHaveBeenCalledWith({
        where: { userid: 'user123' }
      });

      const { passhash, ...userData } = mockUser;
      expect(NextResponse.json).toHaveBeenCalledWith({
        ...userData,
        rosters: mockRosters,
      });
    });

    test('handles database errors', async () => {
      // Mock console.error to prevent it from cluttering the test output
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = createMockRequest({ username: 'testuser' });

      mockPrisma.user.findUnique.mockRejectedValueOnce(new Error('Database error'));

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Server error' },
        { status: 500 }
      );

      // Restore console.error
      console.error.mockRestore();
    });
  });
});
