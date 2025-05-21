import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Constants for cookie settings
const COOKIE_NAME = 'asid';
const COOKIE_SEPARATOR = '|';
const COOKIE_EXPIRATION = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generates a short random ID for sessions
 * @returns {string} A short random ID
 */
function generateShortId() {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Gets the current time as a Date object
 * @returns {Date} The current time
 */
function getCurrentTime() {
  return new Date();
}

/**
 * Handles GET requests to check if a user is authenticated
 * @returns {Promise<NextResponse>} The response
 */
export async function GET() {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    // Parse the session cookie
    const [sessionId, userId] = sessionCookie.value.split(COOKIE_SEPARATOR);

    if (!sessionId || !userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check if the session exists in the database
    const session = await prisma.session.findUnique({
      where: { sessionid: sessionId },
      include: { User: true }
    });

    if (!session || session.userid !== userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Update the session's last activity time
    await prisma.session.update({
      where: { sessionid: sessionId },
      data: { lastactivity: getCurrentTime() }
    });

    // Return the user data (excluding sensitive information)
    const { passhash, ...userData } = session.User;
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Session GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * Handles POST requests to log in a user
 * @param {Request} request The request object
 * @returns {Promise<NextResponse>} The response
 */
export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (username.length > 50 || password.length > 50) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Find the user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.passhash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Create a new session
    const sessionId = generateShortId();
    await prisma.session.create({
      data: {
        sessionid: sessionId,
        userid: user.userid,
        lastactivity: getCurrentTime()
      }
    });

    // Set the session cookie
    const cookieValue = `${sessionId}${COOKIE_SEPARATOR}${user.userid}`;
    const cookieOptions = {
      expires: new Date(Date.now() + COOKIE_EXPIRATION * 1000),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    // Return the user data (excluding sensitive information)
    const { passhash, ...userData } = user;
    
    // Create the response
    const response = NextResponse.json(userData);
    
    // Set the cookie
    response.cookies.set(COOKIE_NAME, cookieValue, cookieOptions);
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to log out a user
 * @returns {Promise<NextResponse>} The response
 */
export async function DELETE() {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (sessionCookie && sessionCookie.value) {
      // Parse the session cookie
      const [sessionId] = sessionCookie.value.split(COOKIE_SEPARATOR);

      if (sessionId) {
        // Delete the session from the database
        await prisma.session.delete({
          where: { sessionid: sessionId }
        }).catch(() => {
          // Ignore errors if the session doesn't exist
        });
      }
    }

    // Clear the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}