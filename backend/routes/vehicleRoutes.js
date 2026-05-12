const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Vehicle = require('../models/Vehicle');
const { protect, lender } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/vehicles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `vehicle-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

// @route   GET /api/vehicles
// @desc    Get all available vehicles with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, search, maxPrice } = req.query;

    // Always only show available vehicles on the public listing
    let query = { isAvailable: true };

    if (type) {
      const typesArray = type.split(',');
      query.type = { $in: typesArray };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (maxPrice) {
      query.pricePerHour = { $lte: Number(maxPrice) };
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching vehicles' });
  }
});

// @route   GET /api/vehicles/vendor/my-vehicles
// @desc    Get all vehicles owned by logged in vendor
// @access  Private/Lender
// IMPORTANT: Must be defined BEFORE /:id to avoid Express matching "vendor" as an id
router.get('/vendor/my-vehicles', protect, lender, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ vendorId: req.user._id }).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching your vehicles' });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(500).json({ message: 'Server Error fetching vehicle details' });
  }
});

// @route   POST /api/vehicles/upload
// @desc    Upload vehicle image
// @access  Private/Lender
// IMPORTANT: Must be before POST /:id patterns
router.post('/upload', protect, lender, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image' });
  }
  res.json({ imageUrl: `/uploads/vehicles/${req.file.filename}` });
});

// @route   POST /api/vehicles
// @desc    Add a new vehicle
// @access  Private/Lender
router.post('/', protect, lender, async (req, res) => {
  try {
    const { name, type, pricePerHour, pricePerDay, location, range, description, imageUrl, specifications } = req.body;

    const vehicle = new Vehicle({
      name,
      type,
      pricePerHour,
      pricePerDay,
      location,
      range,
      description,
      imageUrl,
      specifications,
      vendorId: req.user._id,
      isAvailable: true
    });

    const createdVehicle = await vehicle.save();
    res.status(201).json(createdVehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating vehicle' });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update a vehicle
// @access  Private/Lender
router.put('/:id', protect, lender, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.vendorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this vehicle' });
    }

    const { name, type, pricePerHour, pricePerDay, location, range, description, imageUrl, isAvailable, specifications } = req.body;

    if (name !== undefined) vehicle.name = name;
    if (type !== undefined) vehicle.type = type;
    if (pricePerHour !== undefined) vehicle.pricePerHour = pricePerHour;
    if (pricePerDay !== undefined) vehicle.pricePerDay = pricePerDay;
    if (location !== undefined) vehicle.location = location;
    if (range !== undefined) vehicle.range = range;
    if (description !== undefined) vehicle.description = description;
    if (imageUrl !== undefined) vehicle.imageUrl = imageUrl;
    if (isAvailable !== undefined) vehicle.isAvailable = isAvailable;
    if (specifications !== undefined) vehicle.specifications = specifications;

    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating vehicle' });
  }
});

module.exports = router;
