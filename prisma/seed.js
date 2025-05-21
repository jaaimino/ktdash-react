// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
 * Creates a new user
 * @param {string} username The username
 * @param {string} password The password
 * @returns {Promise<Object>} The created user
 */
async function createUser(username, password) {
  // Validate username format (letters, numbers, underscores only)
  if (!username.match(/^[a-zA-Z0-9_]+$/)) {
    throw new Error('Invalid username - Only letters, numbers, and underscores allowed');
  }

  // Validate username length
  if (username.length < 5) {
    throw new Error('Username must be at least 5 characters');
  }

  if (username.length > 50) {
    throw new Error('Username must be at most 50 characters');
  }

  // Check if username contains an email address
  if (username.includes('@')) {
    throw new Error('Please do not use an email address as your username');
  }

  // Check if username is already taken
  const existingUser = await prisma.user.findUnique({
    where: { username }
  });

  if (existingUser) {
    throw new Error('Username already taken');
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

  return newUser;
}

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node prisma/seed.js <username> <password>');
    process.exit(1);
  }
  
  const [username, password] = args;
  
  try {
    const user = await createUser(username, password);
    console.log('User created successfully:');
    console.log(`Username: ${user.username}`);
    console.log(`User ID: ${user.userid}`);
    console.log(`Created: ${user.createddate}`);
  } catch (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();