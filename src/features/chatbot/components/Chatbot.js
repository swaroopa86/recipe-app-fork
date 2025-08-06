import React, { useState } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { from: 'Pantry mate', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages([...messages, { from: 'user', text: userMessage }]);

    setTimeout(() => {
      let botResponse = "I'm not sure how to help with that yet.";

      if (/hello|hi|hey/i.test(userMessage)) {
        botResponse = "Hello! How can I assist you today?";
      } else if (/recipe/i.test(userMessage)) {
        botResponse = "Looking for a recipe? Tell me what ingredients you have!";
      } else if (/pantry/i.test(userMessage)) {
        botResponse = "I can help you manage your pantry. What would you like to do?";
      }

      setMessages(msgs => [
        ...msgs,
        { from: 'Pantry mate', text: botResponse }
      ]);
    }, 500);

    setInput('');
  };

  if (isCollapsed) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 50,
          height: 50,
          background: '#007bff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontSize: '24px',
          transition: 'all 0.2s ease'
        }}
        onClick={() => setIsCollapsed(false)}
        onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        title="Open Pantry Mate Chatbot"
      >
        🤖
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid #ccc',
      width: 300,
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div 
        style={{
          padding: '10px 12px',
          background: '#f5f5f5',
          borderRadius: '8px 8px 0 0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setIsCollapsed(true)}
      >
        <span>🤖 Pantry Mate</span>
        <span>▼</span>
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 8 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.from === 'Pantry mate' ? 'left' : 'right', margin: '4px 0' }}>
              <b>{msg.from === 'Pantry mate' ? 'Pantry mate' : 'You'}:</b> {msg.text}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 4 }}
          />
          <button onClick={handleSend} style={{ padding: '6px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;