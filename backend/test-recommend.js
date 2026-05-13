require('dotenv').config();
const OpenAI = require('openai');
const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');

const getGroqClient = () => new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' });

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  try {
    const query = "i want to go for a city drive in a scooter";
    const vehicles = await Vehicle.find({ isAvailable: true }).select('name type pricePerHour location range rating description _id');
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

    console.log("Raw Response:", completion.choices[0].message.content);
    const result = JSON.parse(completion.choices[0].message.content);
    console.log("Parsed JSON:", result);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    mongoose.disconnect();
  }
}
test();
