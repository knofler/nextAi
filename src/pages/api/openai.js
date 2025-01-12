import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { api, query } = req.body;

  let apiKey;
  let openai;
  let model;
  let apiUrl;

  switch (api) {
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY;
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      openai = new OpenAI({
        apiKey: apiKey,
      });
      model = 'gpt-4o'; // Ensure you have access to this model
      break;
    case 'deepseek':
      apiKey = process.env.DEEPSEEK_API_KEY;
      apiUrl = 'https://api.deepseek.com/v1/chat/completions';
      openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: apiKey,
      });
      model = 'deepseek-chat';
      break;
    default:
      return res.status(400).json({ message: 'Invalid API selected' });
  }

  // Log the API key for debugging purposes
  console.log(`Using ${api} API Key:`, apiKey);

  if (!apiKey) {
    return res.status(401).json({ message: 'API key is missing or invalid' });
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 500,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: query },
        ],
        stream: true, // Enable streaming
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${text}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let fullResponse = '';

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunk = decoder.decode(value, { stream: true });

      // Log the chunk received from the stream
      console.log('Chunk received:', chunk);

      // Split the chunk by newlines to handle multiple JSON objects
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        // Log each line for debugging
        console.log('Processing line:', line);

        // Skip empty lines
        if (!line.trim()) continue;

        // Check for the [DONE] message
        if (line.trim() === 'data: [DONE]') {
          console.log('Detected [DONE] message');
          done = true;
          break;
        }

        // Process JSON data
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.replace(/^data: /, ''));
            if (json.choices[0].delta.content) {
              const content = json.choices[0].delta.content;
              fullResponse += content;
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }
    }

    // Return the full response as a non-streaming response
    res.status(200).json({ result: fullResponse });
  } catch (error) {
    console.error('Error creating chat completion:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}