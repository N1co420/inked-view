// backend/services/auth.service.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Artist = require('../models/Artist');

/**
 * Registers a new artist in the database.
 * @param {object} artistData - The data for the new artist.
 * @param {string} artistData.email - The artist's email.
 * @param {string} artistData.password - The artist's plaintext password.
 * @param {string} artistData.name - The artist's name.
 * @returns {Promise<object>} The saved artist document.
 * @throws {Error} If the email already exists.
 */
async function register(artistData) {
  const { email, password, name } = artistData;

  // Check if artist already exists
  const existingArtist = await Artist.findOne({ email });
  if (existingArtist) {
    // We throw a generic error here, which the controller will catch and format.
    throw new Error('EMAIL_EXISTS');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create and save new artist
  const newArtist = new Artist({
    name,
    email,
    password: hashedPassword,
  });

  return newArtist.save();
}

/**
 * Authenticates an artist and returns a JWT.
 * @param {object} loginData - The artist's login credentials.
 * @param {string} loginData.email - The artist's email.
 * @param {string} loginData.password - The artist's plaintext password.
 * @returns {Promise<string>} The generated JSON Web Token.
 * @throws {Error} If credentials are invalid.
 */
async function login(loginData) {
  const { email, password } = loginData;

  // 1. Find user by email
  const artist = await Artist.findOne({ email });
  if (!artist) {
    // Do not specify whether the email or password was wrong for security.
    throw new Error('INVALID_CREDENTIALS');
  }

  // 2. Compare password with the stored hash
  const isMatch = await bcrypt.compare(password, artist.password);
  if (!isMatch) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // 3. Create JWT Payload
  const payload = {
    id: artist._id,
    name: artist.name,
  };

  // 4. Sign the token and return it
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token is valid for 1 day
  });

  return token;
}

module.exports = {
  register,
  login,
};