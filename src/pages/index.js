import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const text = await res.text(); // Get the raw response text

      if (!res.ok) {
        throw new Error(`Request failed with status code ${res.status}: ${text}`);
      }

      try {
        const data = JSON.parse(text); // Parse the JSON response
        setResponse(data.result);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', text);
        throw new Error(`Failed to parse JSON response: ${text}`);
      }
    } catch (error) {
      console.error('Error during API call:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>OpenAI Chat</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something..."
        />
        <button type="submit" disabled={isLoading}>Submit</button>
      </form>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && (
        <div>
          <h2>Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}