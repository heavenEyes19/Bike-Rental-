const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { protect, lender } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/bookings/create-order
// @desc    Create Razorpay Order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { vehicleId, durationHours, startDate } = req.body;

    // Security Check: KYC
    if (req.user.kycStatus !== 'verified') {
      return res.status(403).json({ message: 'KYC not verified. Please verify your identity first.' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({ message: 'Vehicle is currently unavailable' });
    }

    // Calculate total amount (Base + Platform Fee + 18% Tax)
    const baseFare = vehicle.pricePerHour * durationHours;
    const platformFee = 5;
    const taxes = Math.round((baseFare + platformFee) * 0.18);
    const totalAmount = baseFare + platformFee + taxes;

    const options = {
      amount: totalAmount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      totalAmount,
      vehicle: {
        name: vehicle.name,
        pricePerHour: vehicle.pricePerHour
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// @route   POST /api/bookings/verify-payment
// @desc    Verify Razorpay Payment and Create Booking
// @access  Private
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      vehicleId,
      durationHours,
      startDate,
      totalAmount
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      const booking = new Booking({
        user: req.user._id,
        vehicle: vehicleId,
        startDate: startDate ? new Date(startDate) : new Date(),
        durationHours,
        totalAmount,
        status: 'confirmed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });

      await booking.save();
      
      // Optionally mark vehicle as unavailable here
      // await Vehicle.findByIdAndUpdate(vehicleId, { isAvailable: false });

      return res.status(200).json({ message: "Payment verified successfully", bookingId: booking._id });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get logged in user's bookings
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('vehicle', 'name imageUrl type location').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching bookings' });
  }
});

// @route   GET /api/bookings/vendor/requests
// @desc    Get all bookings for vehicles owned by the logged in vendor
// @access  Private/Lender
// IMPORTANT: Must be defined BEFORE /:id to avoid Express matching "vendor" as a booking ID
router.get('/vendor/requests', protect, lender, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ vendorId: req.user._id });
    const vehicleIds = vehicles.map(v => v._id);

    const bookings = await Booking.find({ vehicle: { $in: vehicleIds } })
      .populate('vehicle', 'name imageUrl type location pricePerHour')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching vendor bookings' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking details by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Security check: only the user who made it, the vendor, or an admin can view
    const isUser = booking.user._id.toString() === req.user._id.toString();
    const isVendor = booking.vehicle.vendorId && booking.vehicle.vendorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isUser && !isVendor && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server Error fetching booking details' });
  }
});



// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (accept/reject/complete)
// @access  Private/Lender
router.put('/:id/status', protect, lender, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('vehicle');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the vendor owns the vehicle in the booking
    if (booking.vehicle.vendorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to manage this booking' });
    }

    booking.status = status;
    const updatedBooking = await booking.save();
    
    // Automatic Vehicle Handoff: When completed, update vehicle location to last known rider location
    if (status === 'completed' && booking.lastKnownLocation) {
      await Vehicle.findByIdAndUpdate(booking.vehicle._id, { 
        isAvailable: true,
        locationCoordinates: booking.lastKnownLocation
      });
    } else if (status === 'cancelled') {
      await Vehicle.findByIdAndUpdate(booking.vehicle._id, { isAvailable: true });
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating booking status' });
  }
});

// @route   PUT /api/bookings/:id/live-location
// @desc    Update booking's live GPS location and append to routeHistory
// @access  Private
router.put('/:id/live-location', protect, async (req, res) => {
  try {
    const { lat, lng, speed = 0 } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update last known location
    booking.lastKnownLocation = { lat, lng };

    // Append to route history (cap at 1000 points to avoid unbounded growth)
    if (booking.routeHistory.length < 1000) {
      booking.routeHistory.push({ lat, lng, speed, timestamp: new Date() });
    }

    await booking.save();

    // Also broadcast via Socket.IO to anyone watching this booking room
    const io = req.app.get('io');
    if (io) {
      io.to(`booking-${booking._id}`).emit('location-update', { lat, lng, speed });
    }

    res.json({ message: 'Location updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating live location' });
  }
});

// @route   GET /api/bookings/:id/route
// @desc    Get full route history for a booking (for ride replay)
// @access  Private
router.get('/:id/route', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .select('routeHistory lastKnownLocation rideDistanceKm status user vehicle')
      .populate('vehicle', 'name locationCoordinates');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only the user or the vehicle's vendor can view
    const isUser = booking.user.toString() === req.user._id.toString();
    if (!isUser && req.user.role !== 'admin' && req.user.role !== 'lender') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching route' });
  }
});

module.exports = router;
