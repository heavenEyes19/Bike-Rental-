const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Electric Scooter', 'Motorbike', 'Bicycle'],
  },
  brand: {
    type: String,
  },
  pricePerHour: {
    type: Number,
    required: true,
  },
  pricePerDay: {
    type: Number,
    required: true,
  },
  range: {
    type: String, // e.g., '120 km', 'Full Tank'
  },
  location: {
    type: String, // Instructions / Nearby Areas
    required: true,
  },
  locationCoordinates: {
    lat: Number,
    lng: Number
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: String, // Placeholder URL for now
  },
  description: {
    type: String,
  },
  specifications: {
    topSpeed: String,
    weight: String,
    batteryOrEngine: String,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Will link to Lender later
  }
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
