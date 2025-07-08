// backend/services/__tests__/studio.service.test.js

const mongoose = require('mongoose');
const studioService = require('../studio.service');
const Artist = require('../../models/Artist');
const Studio = require('../../models/Studio');

// Die 'beforeAll' und 'afterAll' Hooks für die DB-Verbindung bleiben.
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Studio Service', () => {
  describe('createStudio', () => {
    
    // Wir löschen den 'beforeEach'-Hook komplett.
    
    it('should create a new studio and update the artist document', async () => {
      // ARRANGE: Erstelle alle notwendigen Daten direkt im Test.
      await Studio.deleteMany({});
      await Artist.deleteMany({});
      
      const artist = await new Artist({
        name: 'Studio Owner',
        email: 'owner@studio.com',
        password: 'hashedpassword',
      }).save();
      
      const studioData = { name: 'Art Temple', region: 'Berlin' };
      
      // ACT: Führe die zu testende Funktion aus.
      const newStudio = await studioService.createStudio(studioData, artist._id);

      // ASSERT: Überprüfe die Ergebnisse.
      const updatedArtist = await Artist.findById(artist._id);

      // 1. Überprüfe das Studio-Dokument
      expect(newStudio).toBeDefined();
      expect(newStudio.name).toBe(studioData.name);
      expect(newStudio.owners[0].toString()).toBe(artist._id.toString());

      // 2. Überprüfe das Künstler-Dokument
      expect(updatedArtist).toBeDefined(); // Dieser Check ist wichtig
      expect(updatedArtist.studio.toString()).toBe(newStudio._id.toString());
    });
  });
});