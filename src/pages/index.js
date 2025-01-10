import { useState } from 'react';
import styles from '../styles/Chat.module.css';

export default function Home() {
  const [api, setApi] = useState('openai');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const newMessage = { role: 'user', content: query };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setQuery('');

    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api, query }),
      });

      const text = await res.text(); // Get the raw response text

      if (!res.ok) {
        throw new Error(`Request failed with status code ${res.status}: ${text}`);
      }

      try {
        const data = JSON.parse(text); // Parse the JSON response
        const aiMessage = { role: 'assistant', content: `[${api.toUpperCase()}] ${data.result}` };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
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
    <div className={styles.chatContainer}>
      <h1>AI Chat</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Select API:
          <select value={api} onChange={(e) => setApi(e.target.value)}>
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </label>
        <div className={styles.chatBox}>
          {messages.map((message, index) => (
            <div key={index} className={`${styles.chatMessage} ${styles[message.role]}`}>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !query.trim()}>Send</button>
        </div>
      </form>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}