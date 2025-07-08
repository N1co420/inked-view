// backend/models/Studio.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studioSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  region: {
    type: String,
    required: true,
    trim: true,
  },
  // Ein Studio muss mindestens einen Besitzer haben
  owners: [{
    type: Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  }],
  // Alle Künstler, die im Studio arbeiten (inkl. der Besitzer)
  artists: [{
    type: Schema.Types.ObjectId,
    ref: 'Artist',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Studio', studioSchema);