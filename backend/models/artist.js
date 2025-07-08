// backend/models/Artist.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artistSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Jede E-Mail darf nur einmal vorkommen
        trim: true,   
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    styles: {
        type: [String], // Ein Array aus Strings
        default: []     // Standardwert ist ein leeres Array
    },
    instagramHandle: {
        type: String,
        trim: true
    },
    studio: {
        type: Schema.Types.ObjectId, // Speichert die ID eines Studio-Dokuments
        ref: 'Studio'                // Sagt Mongoose, in welcher Collection es suchen soll
    }
}, {
    // Fügt automatisch die Felder `createdAt` und `updatedAt` hinzu
    timestamps: true
});

// Erstellt das Model aus dem Schema und exportiert es
module.exports = mongoose.model('Artist', artistSchema);