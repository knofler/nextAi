import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ghcolors } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import styles from '../styles/Chat.module.css';

export default function Chat() {
  const [api, setApi] = useState('deepseek'); // Set default to 'deepseek'
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [previousQueries, setPreviousQueries] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputMoved, setInputMoved] = useState(false);
  const [useCustomApiKey, setUseCustomApiKey] = useState(false); // Checkbox state
  const [customApiKey, setCustomApiKey] = useState(''); // Custom API key input
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const newMessage = { role: 'user', content: query, api };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setPreviousQueries((prevQueries) => [...new Set([query, ...prevQueries])]);
    setQuery('');

    const effectiveApiKey = useCustomApiKey ? customApiKey : ''; // Determine effective API key
    console.log('Effective API Key:', effectiveApiKey); // Log effective API key

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api, query, userAPIKey: effectiveApiKey }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.log(`Request failed with status ${response.status}: ${text}`);
        
        // Extract the error message
        let errorMessage = 'An error occurred. Please try again.';
        try {
          const errorJson = JSON.parse(text);
          if (errorJson.error && errorJson.error.message) {
            errorMessage = `Authentication Fails: ${errorJson.error.message}`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }

        return setError(errorMessage);
      }

      if (api === 'llama3.2' || api === 'gemma') {
        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, { role: 'ai', content: data.content, api }]);
      } else {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Streaming not supported by the API');
        }

        const decoder = new TextDecoder();
        let done = false;

        let responseContent = ''; // Store the response content

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
                    responseContent += content; // Append content to the response content
                    setMessages((prevMessages) => {
                      const lastMessage = prevMessages[prevMessages.length - 1];
                      if (lastMessage && lastMessage.role === 'ai' && lastMessage.api === api) {
                        // Append to the last AI message
                        lastMessage.content += content;
                        return [...prevMessages.slice(0, -1), lastMessage];
                      } else {
                        // Add a new AI message
                        return [...prevMessages, { role: 'ai', content, api }];
                      }
                    });
                    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                  }
                } catch (error) {
                  console.error('Error parsing JSON:', error);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during API call:', error);
      setError('An error occurred while processing your request. Please try again.'); // Display user-friendly error message
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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Customize the ghcolors theme for a dark background
  const customTheme = {
    ...ghcolors,
    'pre[class*="language-"]': {
      ...ghcolors['pre[class*="language-"]'],
      background: '#181d28', // Dark background
      color: '#ffffff', // Light text color
    },
    'code[class*="language-"]': {
      ...ghcolors['code[class*="language-"]'],
      background: '#181d28', // Dark background
      color: '#ffffff', // Light text color
    },
    '.token.comment': {
      color: '#6a9955', // Light green for comments
    },
    '.token.keyword': {
      color: '#569cd6', // Light blue for keywords
    },
    '.token.string': {
      color: '#ce9178', // Light orange for strings
    },
    '.token.function': {
      color: '#dcdcaa', // Light yellow for functions
    },
    '.token.punctuation': {
      color: '#ffffff', // Bright white for punctuation
    },
    '.token.operator': {
      color: '#ff79c6', // Bright pink for operators (e.g., +, -, *, /)
    },
    '.token.brace': {
      color: '#50fa7b', // Bright green for braces { }
    },
    '.token.bracket': {
      color: '#ffb86c', // Bright orange for brackets [ ]
    },
    '.token.paren': {
      color: '#8be9fd', // Bright cyan for parentheses ( )
    },
  };

  return (
    <div className={styles.chatContainer} ref={chatContainerRef}>
      <h1>AI Agents</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.selectContainer}>
            <label className={styles.selectLabel}>Select AI:</label>
            <select value={api} onChange={(e) => setApi(e.target.value)} className={styles.select}>
              <option value="deepseek">DeepSeek</option>
              <option value="openai">OpenAI</option>
              <option value="llama3.2">Llama3.2</option>
              <option value="gemma">Gemma</option>
            </select>
          </div>

          {/* Owner API Key Checkbox and Input Field */}
          <div className={styles.apiKeyContainer}>
            <label className={styles.apiKeyLabel}>
              <input
                type="checkbox"
                checked={useCustomApiKey}
                onChange={(e) => setUseCustomApiKey(e.target.checked)}
              />
              Owner API Key
            </label>
            <input
              type="text"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="Enter your API key"
              className={styles.apiKeyInput}
              disabled={!useCustomApiKey}
            />
          </div>
        </div>

        <div className={styles.chatBoundary}>
          <div className={styles.chatBox} ref={chatBoxRef}>
            {messages.map((message, index) => (
              <div key={index} className={message.role === 'user' ? styles.userMessage : styles.aiMessage}>
                <strong>{message.role === 'user' ? <span className={styles.userName}>Question:</span> : capitalizeFirstLetter(message.api)} </strong>
                <span>
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        return !inline ? (
                          <SyntaxHighlighter
                            language="javascript"
                            style={customTheme} // Use the custom theme
                            PreTag="pre"
                            className={styles.codeBlock}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={`${className} ${styles.codeBlock}`} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {capitalizeFirstLetter(message.content)}
                  </ReactMarkdown>
                </span>
              </div>
            ))}
          </div>
          <div className={`${styles.inputContainer} ${inputMoved ? styles.inputMoved : ''}`}>
            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AI"
              className={styles.inputText}
              rows="1"
              list="previous-queries"
            />
            <datalist id="previous-queries">
              {previousQueries.map((prevQuery, index) => (
                <option key={index} value={prevQuery} />
              ))}
            </datalist>
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
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}