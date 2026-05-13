const express = require('express');
const router = express.Router();
const { suggestPrice, chatSupport, recommendVehicles } = require('../controllers/aiController');

// All AI endpoints
router.post('/suggest-price', suggestPrice);
router.post('/chat', chatSupport);
router.post('/recommend', recommendVehicles);

module.exports = router;
