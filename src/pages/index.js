import { useState, useRef } from 'react';
import styles from '../styles/Chat.module.css';

export default function Chat() {
  const [api, setApi] = useState('deepseek'); // Set default to 'deepseek'
  const [query, setQuery] = useState('');
  const [inputMoved, setInputMoved] = useState(false);
  const chatBoxRef = useRef(null);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userMessage = document.createElement('div');
    userMessage.className = styles.userMessage;
    userMessage.innerHTML = `<strong>User: </strong><span>${query}</span>`;
    chatBoxRef.current.appendChild(userMessage);
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    setQuery('');
    setInputMoved(true);

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api, query }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${text}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      const aiMessage = document.createElement('div');
      aiMessage.className = styles.aiMessage;
      aiMessage.innerHTML = `<strong>${capitalizeFirstLetter(api)}: </strong><span></span>`;
      chatBoxRef.current.appendChild(aiMessage);
      const aiContent = aiMessage.querySelector('span');

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });

        // Log the chunk received from the stream
        console.log('Chunk received from server:', chunk);

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
            const jsonString = line.replace(/^data: /, '').trim();
            console.log('Parsing JSON:', jsonString);
            if (jsonString) {
              try {
                const json = JSON.parse(jsonString);
                if (json.content) {
                  const content = json.content;
                  console.log('Appending content:', content);
                  aiContent.innerHTML += content; // Use innerHTML to preserve formatting
                  chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                }
              } catch (error) {
                console.error('Error parsing JSON:', error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during API call:', error);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <h1>AI Agents</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.selectContainer}>
          <label className={styles.selectLabel}>Select AI:</label>
          <select value={api} onChange={(e) => setApi(e.target.value)} className={styles.select}>
            <option value="deepseek">DeepSeek</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>
        <div className={styles.chatBoundary}>
          <div className={styles.chatBox} ref={chatBoxRef}></div>
          <div className={`${styles.inputContainer} ${inputMoved ? styles.inputMoved : ''}`}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Message AI"
              className={styles.inputText}
            />
            <button
              type="submit"
              className={`${styles.button} ${!query.trim() ? styles.buttonDisabled : ''}`}
              disabled={!query.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}