import React, { useState } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { from: 'Pantry mate', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

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

  return (
    <div style={{
      border: '1px solid #ccc',
      padding: 16,
      width: 320,
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.from === 'Pantry mate' ? 'left' : 'right', margin: '4px 0' }}>
            <b>{msg.from === 'Pantry mate' ? 'Pantry mate' : 'You'}:</b> {msg.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="Type your message..."
        style={{ width: '70%', marginRight: 4 }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default Chatbot;