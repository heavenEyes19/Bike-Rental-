const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Vehicle',
  },
  startDate: {
    type: Date,
    required: true,
  },
  durationHours: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  // Last known GPS position of rider (updated every few seconds during ride)
  lastKnownLocation: {
    lat: Number,
    lng: Number
  },
  // Full route history stored during the ride for replay
  routeHistory: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number, default: 0 }, // km/h
    timestamp: { type: Date, default: Date.now }
  }],
  // Total distance ridden in km (calculated at ride end)
  rideDistanceKm: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
