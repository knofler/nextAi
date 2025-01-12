import { useState, useRef, useEffect } from 'react';
import styles from '../styles/Chat.module.css';

export default function Chat() {
  const [api, setApi] = useState('deepseek'); // Set default to 'deepseek'
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputMoved, setInputMoved] = useState(false);
  const chatBoxRef = useRef(null);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(`Request failed with status code ${res.status}: ${data.error}`);
      }

      const aiMessage = { role: 'assistant', content: `[${capitalizeFirstLetter(api)}] ${data.result}` };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error during API call:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setInputMoved(true);
      if (chatBoxRef.current) {
        chatBoxRef.current.style.maxHeight = 'calc(100vh - 200px)';
      }
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessageContent = (content) => {
    const tokens = content.split(' ');
    const paragraphs = [];
    let currentParagraph = [];

    tokens.forEach((token, index) => {
      currentParagraph.push(token);
      if ((index + 1) % 100 === 0 || index === tokens.length - 1) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    });

    return paragraphs.map((paragraph, index) => (
      <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
    ));
  };

  const renderMessage = (message) => {
    const content = message.content;

    // Check for headings and list items
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h2 key={index} dangerouslySetInnerHTML={{ __html: line.slice(2, -2).trim() }} />;
      }
      if (line.startsWith('###')) {
        return <h3 key={index} dangerouslySetInnerHTML={{ __html: line.slice(3).trim() }} />;
      }
      if (line.match(/^\d+\.\s\*\*.*\*\*:/)) {
        const [heading, ...rest] = line.split(':');
        return (
          <li key={index}>
            <strong dangerouslySetInnerHTML={{ __html: heading.replace(/\*\*/g, '').trim() }} />: {rest.join(':').trim()}
          </li>
        );
      }
      return <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
    });
  };

  return (
    <div className={styles.chatContainer}>
      <h1>AI Agents</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Select AI:
          <select value={api} onChange={(e) => setApi(e.target.value)} className={styles.select}>
            <option value="deepseek">DeepSeek</option>
            <option value="openai">OpenAI</option>
          </select>
        </label>
        <div className={styles.chatBoundary}>
          {messages.length > 0 && (
            <div className={styles.chatBox} ref={chatBoxRef}>
              {messages.map((message, index) => (
                <div key={index} className={`${styles.chatMessage} ${styles[message.role]}`}>
                  {renderMessage(message)}
                </div>
              ))}
              <div className={styles.statusMessage}>
                {isLoading && <p>Loading...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
              </div>
            </div>
          )}
          <div className={`${styles.inputContainer} ${inputMoved ? styles.inputMoved : ''}`}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Message AI"
              className={styles.inputText}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`${styles.button} ${isLoading || !query.trim() ? styles.buttonDisabled : ''}`}
              disabled={isLoading || !query.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}