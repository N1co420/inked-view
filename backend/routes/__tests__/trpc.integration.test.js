// backend/routes/__tests__/trpc.integration.test.js

const mongoose = require('mongoose');
const { appRouter } = require('../trpc');
const authService = require('../../services/auth.service');
const Artist = require('../../models/Artist');

let testArtist;
let authToken;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  
  // HIER IST DIE KORREKTUR:
  // Stelle sicher, dass die Datenbank vor dem Setup leer ist.
  await Artist.deleteMany({});

  // Erstelle einen Test-Künstler und logge ihn ein, um einen gültigen Token zu erhalten
  await authService.register({ name: 'Protected User', email: 'protected@test.com', password: 'password123' });
  authToken = await authService.login({ email: 'protected@test.com', password: 'password123' });
  const artistData = await Artist.findOne({ email: 'protected@test.com' });
  testArtist = artistData.toObject();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('tRPC Protected Procedures', () => {
  describe('getMe', () => {
    it('should return artist data for a valid token', async () => {
      const caller = appRouter.createCaller({ token: authToken });
      const result = await caller.getMe();
      
      expect(result.artistData.id).toBe(testArtist._id.toString());
      expect(result.artistData.name).toBe(testArtist.name);
    });

    it('should throw an UNAUTHORIZED error if no token is provided', async () => {
      const caller = appRouter.createCaller({ token: null });
      
      await expect(caller.getMe()).rejects.toThrow('Kein Token vorhanden.');
    });

    it('should throw an UNAUTHORIZED error for an invalid token', async () => {
      const caller = appRouter.createCaller({ token: 'invalid.token.string' });
      
      await expect(caller.getMe()).rejects.toThrow('Ungültiger Token.');
    });
  });
});