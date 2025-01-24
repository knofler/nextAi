export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { api, query, userAPIKey } = req.body;

  const localLLMs = ['llama3.2', 'gemma', 'deepseek-coder:6.7b', 'codellama'];

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
    default:
      if (localLLMs.includes(api)) {
        console.log(`${api} API selected and userAPIKey is not required`);
        apiUrl = 'http://localhost:11434/api/generate';
        model = api; // Use the api value directly as the model name
      } else {
        return res.status(400).json({ message: 'Invalid API selected' });
      }
  }

  if (!localLLMs.includes(api) && !apiKey) {
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

    if (!localLLMs.includes(api)) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const body = localLLMs.includes(api) ? JSON.stringify({
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

        // Remove the 'data: ' prefix if present
        const jsonString = line.startsWith('data: ') ? line.replace(/^data: /, '').trim() : line.trim();

        // Check for the [DONE] message
        if (jsonString === '[DONE]') {
          console.log('Detected [DONE] message');
          done = true;
          break;
        }

        try {
          const json = JSON.parse(jsonString);
          if (json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) {
            const content = json.choices[0].delta.content;
            responseContent += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
            res.flush();
          } else if (json.response) {
            responseContent += json.response;
            res.write(`data: ${JSON.stringify({ content: json.response })}\n\n`);
            res.flush();
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          console.error('Line:', line);
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error creating chat completion:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}