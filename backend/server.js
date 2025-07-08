// Lädt die Umgebungsvariablen aus der .env Datei
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const { createExpressMiddleware } = require('@trpc/server/adapters/express');

// Erstellt die Express-App
const app = express();
const { appRouter } = require('./routes/trpc');

// Middleware, damit unser Server JSON-Daten versteht
app.use(express.json());

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
  })
);

app.get('/', (req, res) => {
    res.send('Willkommen bei der InkedView API!');
});

// --- Datenbankverbindung ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Erfolgreich mit MongoDB verbunden! ✅');
        // Server erst starten, nachdem die DB-Verbindung steht
        app.listen(process.env.PORT, () => {
            console.log(`Server läuft auf Port ${process.env.PORT} 🚀`);
        });
    })
    .catch((err) => {
        console.error('Fehler bei der Datenbankverbindung:', err);
    });

// Eine einfache Test-Route
app.get('/', (req, res) => {
    res.send('Willkommen bei der InkedView API!');
});