import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { api, query } = req.body;

  let apiKey;
  let apiUrl;
  let model;

  switch (api) {
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY;
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      model = 'gpt-4'; // Ensure you have access to this model
      break;
    case 'deepseek':
      apiKey = process.env.DEEPSEEK_API_KEY;
      apiUrl = 'https://api.deepseek.com/v1/chat/completions';
      model = 'deepseek-chat';
      break;
    default:
      return res.status(400).json({ message: 'Invalid API selected' });
  }

  if (!apiKey) {
    return res.status(401).json({ message: 'API key is missing or invalid' });
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

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

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunk = decoder.decode(value, { stream: true });

      // Log the chunk received from the stream
      console.log('Chunk received from API:', chunk);

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
          res.write('data: [DONE]\n\n');
          done = true;
          break;
        }

        // Process JSON data
        if (line.startsWith('data: ')) {
          const jsonString = line.replace(/^data: /, '').trim();
          if (jsonString) {
            try {
              const json = JSON.parse(jsonString);
              if (json.choices[0].delta.content) {
                const content = json.choices[0].delta.content.replace(/\n/g, '<br>'); // Replace newlines with <br>
                console.log('Sending content from Server:: ', content);
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
                res.flush(); // Flush the response
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }
      }
    }

    res.end();
  } catch (error) {
    console.error('Error creating chat completion:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}