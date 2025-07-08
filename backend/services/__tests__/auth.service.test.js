// backend/services/__tests__/auth.service.test.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const authService = require('../auth.service'); // Geht eine Ebene hoch zum Service
const Artist = require('../../models/Artist');   // Geht zwei Ebenen hoch zu den Models

// Verbindung zur In-Memory-DB herstellen, bevor die Tests laufen
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL);
});

// Die Verbindung trennen, nachdem alle Tests durchgelaufen sind
afterAll(async () => {
  await mongoose.disconnect();
});

// Die Artist-Collection vor jedem einzelnen Test leeren
beforeEach(async () => {
  await Artist.deleteMany({});
});

describe('Auth Service', () => {
  describe('register', () => {
    const validArtistData = {
      name: 'Test Artist',
      email: 'test@artist.com',
      password: 'password123',
    };

    it('should successfully register a new artist', async () => {
      await authService.register(validArtistData);
      const savedArtist = await Artist.findOne({ email: validArtistData.email });
      
      expect(savedArtist).toBeDefined();
      expect(savedArtist.email).toBe(validArtistData.email);
    });

    it('should store the password as a hash, not plaintext', async () => {
        await authService.register(validArtistData);
        const savedArtist = await Artist.findOne({ email: validArtistData.email });
        
        expect(savedArtist.password).not.toBe(validArtistData.password);
        const isMatch = await bcrypt.compare(validArtistData.password, savedArtist.password);
        expect(isMatch).toBe(true);
    });

    it('should throw an EMAIL_EXISTS error for duplicate emails', async () => {
      await authService.register(validArtistData);
      
      await expect(authService.register(validArtistData)).rejects.toThrow('EMAIL_EXISTS');
    });
  });

  describe('login', () => {
    const artistCredentials = {
        name: 'Login Test',
        email: 'login@test.com',
        password: 'password123',
    };
    
    beforeEach(async () => {
        await authService.register(artistCredentials);
    });

    it('should return a JWT for valid credentials', async () => {
      const token = await authService.login({
        email: artistCredentials.email,
        password: artistCredentials.password,
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should throw an INVALID_CREDENTIALS error for a wrong password', async () => {
        await expect(authService.login({
            email: artistCredentials.email,
            password: 'wrongpassword',
        })).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should throw an INVALID_CREDENTIALS error for a non-existent email', async () => {
        await expect(authService.login({
            email: 'nouser@test.com',
            password: 'password123',
        })).rejects.toThrow('INVALID_CREDENTIALS');
    });
  });
});