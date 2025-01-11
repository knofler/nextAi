import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { api, query } = req.body;

  let apiKey;
  let openai;
  let model;

  switch (api) {
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY;
      openai = new OpenAI({
        apiKey: apiKey,
      });
      model = 'gpt-4o'; // Ensure you have access to this model
      break;
    case 'deepseek':
      apiKey = process.env.DEEPSEEK_API_KEY;
      openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: apiKey,
      });
      model = 'deepseek-chat';
      break;
    default:
      return res.status(400).json({ message: 'Invalid API selected' });
  }

  // Log the API key to verify it is being loaded correctly
  console.log(`Using ${api} API Key:`, apiKey);

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      max_tokens: 500, // Limit response tokens to 200
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: query },
      ],
    });

    res.status(200).json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error creating chat completion:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
}