// backend/services/auth.service.js

const bcrypt = require('bcryptjs');
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

module.exports = {
  register,
};