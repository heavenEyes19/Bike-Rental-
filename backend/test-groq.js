require('dotenv').config();
const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

async function test() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello in JSON format: {"hello": "world"}' }],
      model: 'llama3-8b-8192',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });
    console.log(completion.choices[0].message.content);
  } catch (err) {
    console.error(err);
  }
}
test();
