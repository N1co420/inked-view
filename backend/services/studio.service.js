// backend/services/studio.service.js

const Studio = require('../models/Studio');
const Artist = require('../models/Artist');

/**
 * Creates a new studio and assigns the creator as the owner.
 * @param {object} studioData - The data for the new studio {name, region}.
 * @param {string} ownerId - The ObjectId of the artist creating the studio.
 * @returns {Promise<object>} The newly created studio document.
 * @throws {Error} If the owner artist is not found.
 */
async function createStudio(studioData, ownerId) {
  const { name, region } = studioData;

  // 1. Finde zuerst den Künstler, der das Studio erstellt.
  const owner = await Artist.findById(ownerId);
  if (!owner) {
    // Sicherheitsprüfung, falls eine ungültige ID übergeben wird.
    throw new Error('OWNER_NOT_FOUND');
  }

  // 2. Erstelle das neue Studio-Dokument.
  const studio = new Studio({
    name,
    region,
    owners: [ownerId],
    artists: [ownerId],
  });
  await studio.save();

  // 3. Aktualisiere das Künstler-Dokument explizit und speichere es.
  owner.studio = studio._id;
  await owner.save();

  return studio;
}

module.exports = {
  createStudio,
};