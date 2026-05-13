const OpenAI = require('openai');
const Vehicle = require('../models/Vehicle'); // Need to fetch vehicles for recommendation

// Lazy load to prevent startup crashes if env variables are delayed
const getGroqClient = () => {
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
};

// @desc    Suggest dynamic pricing for a vehicle
// @route   POST /api/ai/suggest-price
// @access  Public
const suggestPrice = async (req, res) => {
  try {
    const { type, name, location, range, description } = req.body;

    const prompt = `You are an expert vehicle rental pricing analyst for 'BikeRentLelo' in India. 
Based on the following vehicle details, suggest a competitive 'pricePerHour' and 'pricePerDay' in Indian Rupees (INR).
Keep the prices realistic for the Indian market.
Vehicle Type: ${type}
Name/Model: ${name}
Location: ${location}
Range/Capacity: ${range}
Description: ${description || 'N/A'}

Respond ONLY with a valid JSON object in this exact format, nothing else:
{
  "pricePerHour": number,
  "pricePerDay": number
}`;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const suggestion = JSON.parse(completion.choices[0].message.content);
    res.json(suggestion);

  } catch (error) {
    console.error('Groq Pricing Error:', error);
    res.status(500).json({ message: 'Failed to generate pricing suggestion.' });
  }
};

// @desc    Chat support for users
// @route   POST /api/ai/chat
// @access  Public
const chatSupport = async (req, res) => {
  try {
    const { messages } = req.body; // Array of {role: 'user' | 'assistant', content: string}

    const systemMessage = {
      role: 'system',
      content: `You are the friendly, helpful AI support assistant for 'BikeRentLelo', an Indian platform for renting electric scooters, motorbikes, and bicycles. 
You answer questions concisely. If a user asks about pricing, explain that it varies by vehicle and they can check the listings. If they ask about rules, tell them they need a valid ID and driving license for motorbikes/scooters. Keep your answers brief and formatting clean.`
    };

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [systemMessage, ...messages],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error('Groq Chat Error:', error);
    res.status(500).json({ message: 'Failed to get chat response.' });
  }
};

// @desc    Smart vehicle recommendations based on user query
// @route   POST /api/ai/recommend
// @access  Public
const recommendVehicles = async (req, res) => {
  try {
    const { query } = req.body;

    // Fetch available vehicles to use as context
    // In a real huge production app, we'd use embeddings, but for a smaller fleet, we can pass it in context
    const vehicles = await Vehicle.find({ isAvailable: true }).select('name type pricePerHour location range rating description _id');

    if (!vehicles || vehicles.length === 0) {
      return res.status(200).json({ message: 'No vehicles currently available to recommend.', recommendedIds: [] });
    }

    const vehicleContext = vehicles.map(v => 
      `ID: ${v._id} | Name: ${v.name} | Type: ${v.type} | Price: ₹${v.pricePerHour}/hr | Location: ${v.location} | Range: ${v.range} | Rating: ${v.rating}`
    ).join('\n');

    const prompt = `You are a smart vehicle recommendation engine for 'BikeRentLelo'.
A user is looking for a vehicle with the following request: "${query}"

Here is the list of currently available vehicles:
${vehicleContext}

Based on the user's request, select the top 1 to 3 best matching vehicles.
Respond ONLY with a valid JSON object in this exact format, nothing else:
{
  "message": "A short, friendly explanation of why you chose these vehicles.",
  "recommendedIds": ["id1", "id2"]
}`;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);

  } catch (error) {
    console.error('Groq Recommend Error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate recommendations.' });
  }
};

module.exports = {
  suggestPrice,
  chatSupport,
  recommendVehicles
};
