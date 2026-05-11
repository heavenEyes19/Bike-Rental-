const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('./models/Vehicle');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeder');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const vehicles = [
  {
    name: 'Ola S1 Pro',
    type: 'Electric Scooter',
    brand: 'Ola',
    pricePerHour: 49,
    pricePerDay: 499,
    range: '120 km',
    location: 'Connaught Place, New Delhi',
    rating: 4.8,
    reviewsCount: 124,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
    description: 'The Ola S1 Pro is a high-performance electric scooter with futuristic design and smart features. Perfect for zipping through city traffic silently.',
    specifications: {
      topSpeed: '116 km/h',
      weight: '125 kg',
      batteryOrEngine: '4 kWh Battery'
    }
  },
  {
    name: 'Royal Enfield Classic 350',
    type: 'Motorbike',
    brand: 'Royal Enfield',
    pricePerHour: 150,
    pricePerDay: 1200,
    range: 'Full Tank (13L)',
    location: 'Hauz Khas, New Delhi',
    rating: 4.9,
    reviewsCount: 342,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    description: 'Experience the legendary thump. The Classic 350 offers a timeless design mixed with modern reliability. Great for weekend getaways.',
    specifications: {
      topSpeed: '114 km/h',
      weight: '195 kg',
      batteryOrEngine: '349cc Engine'
    }
  },
  {
    name: 'Honda Activa 6G',
    type: 'Motorbike', // It's a scooter but running on petrol
    brand: 'Honda',
    pricePerHour: 40,
    pricePerDay: 350,
    range: 'Full Tank (5L)',
    location: 'Karol Bagh, New Delhi',
    rating: 4.7,
    reviewsCount: 512,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1598967557116-3e0e716497f1?auto=format&fit=crop&q=80&w=800', // Need generic scooter image
    description: 'India\'s favorite scooter. Extremely reliable, highly fuel-efficient, and easy to ride in heavy traffic.',
    specifications: {
      topSpeed: '85 km/h',
      weight: '107 kg',
      batteryOrEngine: '109cc Engine'
    }
  },
  {
    name: 'Ather 450X',
    type: 'Electric Scooter',
    brand: 'Ather',
    pricePerHour: 60,
    pricePerDay: 550,
    range: '105 km',
    location: 'Cyber Hub, Gurugram',
    rating: 4.8,
    reviewsCount: 89,
    isAvailable: false, // Testing unavailable state
    imageUrl: 'https://images.unsplash.com/photo-1599813958863-7df643c1dc30?auto=format&fit=crop&q=80&w=800',
    description: 'Quick, smart, and sharp. The Ather 450X offers incredible acceleration and a touch-screen dashboard with navigation.',
    specifications: {
      topSpeed: '90 km/h',
      weight: '111 kg',
      batteryOrEngine: '3.7 kWh Battery'
    }
  },
  {
    name: 'Yamaha R15 V4',
    type: 'Motorbike',
    brand: 'Yamaha',
    pricePerHour: 180,
    pricePerDay: 1500,
    range: 'Full Tank (11L)',
    location: 'South Extension, New Delhi',
    rating: 4.9,
    reviewsCount: 215,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    description: 'Aggressive styling and track-focused performance. The R15 V4 is for those who love adrenaline and sharp handling.',
    specifications: {
      topSpeed: '140 km/h',
      weight: '142 kg',
      batteryOrEngine: '155cc Engine'
    }
  }
];

const seedData = async () => {
  try {
    await connectDB();
    await Vehicle.deleteMany(); // Clear existing vehicles
    console.log('Existing vehicles cleared');

    await Vehicle.insertMany(vehicles);
    console.log('Vehicles seeded successfully!');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
