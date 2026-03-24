import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

// ---- CHATBOX COMPONENT ----
const SimpleChatbox = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your PR Dashboard assistant. Ask me anything about pull requests or how to use this app!", sender: 'bot' },
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const newUserMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');

    fetch('http://localhost:5001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message: input })
    })
      .then(res => res.json())
      .then(data => {
        const botResponse = { id: Date.now() + 1, text: data.reply, sender: 'bot' };
        setMessages(prev => [...prev, botResponse]);
      })
      .catch(err => console.error(err));
  };

  const suggestedQuestions = [
    "What is a pull request?",
    "How do I filter PRs?",
    "What's the difference between Open and Closed PRs?",
    "How do I use this dashboard?"
  ];

  return (
    <div className="chatbox-container flex flex-col h-full bg-gray-50 rounded-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-[#60B8DE] text-white rounded-t-lg shadow-md">
        <h2 className="text-lg font-semibold">AI Support Chat</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition"
          aria-label="Close Chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-grow p-4 space-y-3 overflow-y-auto custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`chatbox-message max-w-[75%] px-4 py-2 rounded-xl text-sm shadow-md ${
                msg.sender === 'user'
                  ? 'bg-[#60B8DE] text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
              }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-xs bg-white border border-[#60B8DE] text-[#1a6e8a] px-3 py-1 rounded-full hover:bg-[#60B8DE] hover:text-white transition"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="chatbox-submit p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="chatbox-message flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60B8DE]"
          />
          <button
            type="submit"
            className="bg-[#60B8DE] text-white p-3 rounded-lg hover:bg-[#60B8DE] transition duration-200"
            aria-label="Send Message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

// ---- END CHATBOX COMPONENT ----

// --- FLOATING BUTTON COMPONENT ---
const FloatingChatButton = () => {
  // State to track whether the chatbox is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle the state
  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  return (
    // Fixed container positions the button and chatbox
    <div className="fixed bottom-4 right-4 z-50">
      
      {/* The main chat icon button with hover scale effect */}
      <button
        onClick={toggleChatbox}
        className={`
          flex items-center justify-center 
          rounded-full 
          w-14 h-14 
          text-white 
          shadow-lg 
          transition-all duration-300 hover:scale-110 
          focus:outline-none cursor-pointer
          ${isOpen ? 'bg-gray-500 hover:bg-gray-500 rotate-45' : 'bg-[#60B8DE] hover:bg-gray-500'}
        `}
        aria-label={isOpen ? "Close Chat" : "Open Chat"}
      >
        {/* Icon changes slightly when open (e.g., a cross or rotates) */}
        <svg 
          className={`w-6 h-6 transition-transform duration-300`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            // Show a simple message icon when closed, and an 'X' when open
            d={isOpen 
                ? "M6 18L18 6M6 6l12 12" 
                : "M8 10h.01M12 10h.01M16 10h.01M12 17v-4m0 0l-2-2m2 2l2-2m-2 2v4m0 0h-4M4 4h16a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4H4a2 2 0 01-2-2V6a2 2 0 012-2z"
            }
          ></path>
        </svg>
      </button>

      {/* Chatbox Container */}
      {isOpen && (
        <div 
          className="
            absolute bottom-16 right-0 
            w-80 md:w-96 h-[500px] 
            bg-white 
            rounded-lg shadow-2xl 
            transition-all duration-300 origin-bottom-right
            animate-in fade-in zoom-in-50
          "
        >
          {/* Render the actual chat interface component */}
          <SimpleChatbox className="chatbox-message" onClose={toggleChatbox} />
        </div>
      )}
    </div>
  );
};

export default FloatingChatButton;