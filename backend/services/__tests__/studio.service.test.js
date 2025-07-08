// backend/services/__tests__/studio.service.test.js

const mongoose = require('mongoose');
const studioService = require('../studio.service');
const Artist = require('../../models/Artist');
const Studio = require('../../models/Studio');

let testArtist;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
  await mongoose.disconnect();
});

// Leere beide Collections vor jedem Test
beforeEach(async () => {
  await Artist.deleteMany({});
  await Studio.deleteMany({});

  // Erstelle einen Test-Künstler, der als Besitzer agieren kann
  testArtist = await new Artist({
    name: 'Studio Owner',
    email: 'owner@studio.com',
    password: 'hashedpassword', // Wir brauchen kein echtes Passwort für diesen Test
  }).save();
});

describe('Studio Service', () => {
  describe('createStudio', () => {
    it('should create a new studio and update the artist document', async () => {
      const studioData = { name: 'Art Temple', region: 'Berlin' };
      
      const newStudio = await studioService.createStudio(studioData, testArtist._id);

      // 1. Überprüfe das Studio-Dokument
      expect(newStudio).toBeDefined();
      expect(newStudio.name).toBe(studioData.name);
      expect(newStudio.owners[0].toString()).toBe(testArtist._id.toString());
      expect(newStudio.artists[0].toString()).toBe(testArtist._id.toString());

      // 2. Überprüfe, ob der Künstler aktualisiert wurde
      const updatedArtist = await Artist.findById(testArtist._id);
      expect(updatedArtist.studio.toString()).toBe(newStudio._id.toString());
    });
  });
});