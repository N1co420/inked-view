// backend/services/studio.service.js

const Studio = require('../models/Studio');
const Artist = require('../models/Artist');
const mongoose = require('mongoose');

/**
 * Creates a new studio and assigns the creator as the owner.
 * @param {object} studioData - The data for the new studio {name, region}.
 * @param {string} ownerId - The ObjectId of the artist creating the studio.
 * @returns {Promise<object>} The newly created studio document.
 */
async function createStudio(studioData, ownerId) {
  const { name, region } = studioData;

  const studio = new Studio({
    name,
    region,
    owners: [ownerId],
    artists: [ownerId], // Der Besitzer arbeitet auch automatisch im Studio
  });

  await studio.save();

  // Wichtig: Aktualisiere auch das Künstler-Dokument, um es mit dem Studio zu verknüpfen
  await Artist.findByIdAndUpdate(ownerId, { studio: studio._id });

  return studio;
}

module.exports = {
  createStudio,
};