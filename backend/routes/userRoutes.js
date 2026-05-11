const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const User = require('../models/User');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      kycStatus: updatedUser.kycStatus,
      kycDocumentUrl: updatedUser.kycDocumentUrl,
      walletBalance: updatedUser.walletBalance
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: 'Server Error during profile update' });
  }
});

// @route   POST /api/users/kyc/upload
// @desc    Upload KYC document
// @access  Private
router.post('/kyc/upload', protect, upload.single('kycDocument'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a document' });
    }

    const fileUrl = `/uploads/kyc/${req.file.filename}`;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kycDocumentUrl = fileUrl;
    user.kycStatus = 'submitted';
    await user.save();

    res.json({ 
      message: 'KYC document uploaded successfully', 
      kycStatus: user.kycStatus,
      kycDocumentUrl: user.kycDocumentUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during upload' });
  }
});

// @route   GET /api/users/kyc-pending
// @desc    Get all pending KYC requests
// @access  Private/Admin
router.get('/kyc-pending', protect, admin, async (req, res) => {
  try {
    const users = await User.find({ kycStatus: 'submitted' }).select('name email kycDocumentUrl createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/users/kyc/:id/approve
// @desc    Approve a KYC request
// @access  Private/Admin
router.put('/kyc/:id/approve', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.kycStatus = 'verified';
    await user.save();
    
    res.json({ message: 'KYC verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/users/kyc/:id/reject
// @desc    Reject a KYC request
// @access  Private/Admin
router.put('/kyc/:id/reject', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.kycStatus = 'rejected';
    await user.save();
    
    res.json({ message: 'KYC rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
