import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Generates a short random ID for users
 * @param {number} length The length of the ID
 * @returns {string} A short random ID
 */
function generateShortId(length = 5) {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
}

/**
 * Handles POST requests to create a new user
 * @param {Request} request The request object
 * @returns {Promise<NextResponse>} The response
 */
export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { username, password, confirmpassword } = body;

    // Validate input
    if (!username || !password || !confirmpassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmpassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Validate username format (letters, numbers, underscores only)
    if (!username.match(/^[a-zA-Z0-9_]+$/)) {
      return NextResponse.json({ 
        error: 'Invalid username - Only letters, numbers, and underscores allowed' 
      }, { status: 400 });
    }

    // Validate username length
    if (username.length < 5) {
      return NextResponse.json({ error: 'Username must be at least 5 characters' }, { status: 400 });
    }

    if (username.length > 50) {
      return NextResponse.json({ error: 'Username must be at most 50 characters' }, { status: 400 });
    }

    // Check if username contains an email address
    if (username.includes('@')) {
      return NextResponse.json({ 
        error: 'Please do not use an email address as your username' 
      }, { status: 400 });
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Generate a unique user ID
    let userId;
    let isUnique = false;
    
    while (!isUnique) {
      userId = generateShortId();
      const existingUserId = await prisma.user.findUnique({
        where: { userid: userId }
      });
      
      if (!existingUserId) {
        isUnique = true;
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        userid: userId,
        username,
        passhash: hashedPassword,
        createddate: new Date()
      }
    });

    // Return the user data (excluding sensitive information)
    const { passhash, ...userData } = newUser;
    return NextResponse.json(userData);
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * Handles GET requests to get a user by username or ID
 * @param {Request} request The request object
 * @returns {Promise<NextResponse>} The response
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const userid = searchParams.get('userid');

    if (!username && !userid) {
      return NextResponse.json({ error: 'Username or userid is required' }, { status: 400 });
    }

    let user;
    
    if (username) {
      user = await prisma.user.findUnique({
        where: { username }
      });
    } else {
      user = await prisma.user.findUnique({
        where: { userid }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the user's rosters
    const rosters = await prisma.roster.findMany({
      where: { userid: user.userid }
    });

    // Return the user data (excluding sensitive information)
    const { passhash, ...userData } = user;
    return NextResponse.json({
      ...userData,
      rosters
    });
  } catch (error) {
    console.error('User retrieval error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}