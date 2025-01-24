import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { api, query, userAPIKey } = req.body;

  let apiKey;
  let apiUrl;
  let model;

  switch (api) {
    case 'openai':
      console.log('OpenAI API selected and userAPIKey is ', userAPIKey);
      apiKey = userAPIKey || process.env.OPENAI_API_KEY;
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      model = 'gpt-4'; // Ensure you have access to this model
      break;
    case 'deepseek':
      console.log('DeepSeek API selected and userAPIKey is ', userAPIKey);
      apiKey = userAPIKey || process.env.DEEPSEEK_API_KEY;
      apiUrl = 'https://api.deepseek.com/v1/chat/completions';
      model = 'deepseek-chat';
      break;
    case 'llama3.2':
      console.log('Llama3.2 API selected and userAPIKey is not required');
      apiUrl = 'http://localhost:11434/api/generate';
      model = 'llama3.2'; // Replace with your correct model name
      break;
    default:
      return res.status(400).json({ message: 'Invalid API selected' });
  }

  if (api !== 'llama3.2' && !apiKey) {
    return res.status(401).json({ message: 'API key is missing or invalid' });
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (api !== 'llama3.2') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const body = api === 'llama3.2' ? JSON.stringify({
      model: model,
      prompt: query,
      max_tokens: 50,
    }) : JSON.stringify({
      model: model,
      max_tokens: 500,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: query },
      ],
      stream: true, // Enable streaming
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${text}`);
    }

    if (api === 'llama3.2') {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let responseContent = '';

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

          try {
            const json = JSON.parse(line);
            if (json.response) {
              responseContent += json.response;
            }
            if (json.done) {
              done = true;
              break;
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
            console.error('Line:', line);
          }
        }
      }

      res.status(200).json({ content: responseContent });
    } else {
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
                  const content = json.choices[0].delta.content;
                  console.log('Sending content from Server:', content);
                  res.write(`data: ${JSON.stringify({ content })}\n\n`); // Send as JSON
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
    }
  } catch (error) {
    console.error('Error creating chat completion:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}