import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! 👋 I'm your Mushroom Safety Assistant. I can help you with:\n\n• Mushroom identification questions\n• Toxicity information\n• Safety guidelines\n• Emergency procedures\n\nHow can I help you today?",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mushroomKnowledge = {
    'poisonous': "☠️ **Poisonous Mushrooms Warning**\n\nThe most dangerous mushrooms include:\n• **Amanita phalloides (Death Cap)** - Extremely deadly\n• **Amanita virosa (Destroying Angel)** - Fatal if consumed\n• **Cortinarius rubellus** - Causes kidney failure\n\n⚠️ NEVER eat wild mushrooms unless identified by an expert!",
    
    'edible': "✅ **Common Edible Mushrooms**\n\n• **Agaricus bisporus** - Common button mushroom\n• **Boletus edulis** - Porcini, prized for cooking\n• **Cantharellus cibarius** - Golden chanterelle\n• **Pleurotus ostreatus** - Oyster mushroom\n\n⚠️ Always verify with an expert before consuming wild mushrooms!",
    
    'emergency': "🚨 **MUSHROOM POISONING EMERGENCY**\n\n**If someone has eaten a potentially poisonous mushroom:**\n\n1. **Call emergency services immediately** (911 or local emergency number)\n2. **Do NOT induce vomiting** unless instructed by medical professionals\n3. **Save a sample** of the mushroom if possible\n4. **Note the time** when the mushroom was consumed\n5. **Watch for symptoms:** nausea, vomiting, diarrhea, abdominal pain\n\n**Poison Control Center:** Contact your local poison control center immediately!",
    
    'identify': "🔍 **How to Identify Mushrooms**\n\nKey features to observe:\n• **Cap shape and color**\n• **Gill structure** (attached, free, etc.)\n• **Stem characteristics**\n• **Spore print color**\n• **Habitat and location**\n• **Smell and texture**\n\n📷 Use our **Identify** feature to upload a photo for AI-powered identification!",
    
    'amanita': "☠️ **Amanita - DANGER!**\n\nAmanita is one of the most dangerous mushroom genera:\n\n• **Death Cap (A. phalloides)** - Responsible for most mushroom deaths\n• **Destroying Angel (A. virosa)** - Pure white and deadly\n• **Fly Agaric (A. muscaria)** - Red with white spots, toxic\n\n**Symptoms appear 6-12 hours after ingestion** and can be fatal!\n\n⚠️ If suspected Amanita consumption, seek IMMEDIATE medical help!",
    
    'safe': "🛡️ **Mushroom Safety Guidelines**\n\n1. **Never eat unidentified mushrooms**\n2. **When in doubt, throw it out**\n3. **Learn from experts** before foraging\n4. **Use multiple identification methods**\n5. **Start with easily identifiable species**\n6. **Keep records** of what you find\n7. **Cook all wild mushrooms** before eating\n8. **Try small amounts first** even with edible species",
    
    'help': "🤖 **I can help you with:**\n\n• Type **'poisonous'** - Learn about dangerous mushrooms\n• Type **'edible'** - Learn about safe mushrooms\n• Type **'emergency'** - Get emergency procedures\n• Type **'identify'** - Tips for identification\n• Type **'amanita'** - Info about deadly Amanita\n• Type **'safe'** - Safety guidelines\n\nOr ask me any question about mushrooms! 🍄",
    
    'default': "I'm here to help with mushroom-related questions! 🍄\n\nYou can ask me about:\n• Specific mushroom species\n• Toxicity levels\n• Identification tips\n• Safety guidelines\n• Emergency procedures\n\nType **'help'** for a list of topics I can assist with!"
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('poison') || message.includes('dangerous') || message.includes('toxic') || message.includes('deadly')) {
      return mushroomKnowledge['poisonous'];
    }
    if (message.includes('edible') || message.includes('eat') || message.includes('safe to eat') || message.includes('can i eat')) {
      return mushroomKnowledge['edible'];
    }
    if (message.includes('emergency') || message.includes('help me') || message.includes('ate') || message.includes('sick') || message.includes('hospital')) {
      return mushroomKnowledge['emergency'];
    }
    if (message.includes('identify') || message.includes('how to') || message.includes('recognize') || message.includes('tell')) {
      return mushroomKnowledge['identify'];
    }
    if (message.includes('amanita') || message.includes('death cap') || message.includes('destroying angel')) {
      return mushroomKnowledge['amanita'];
    }
    if (message.includes('safe') || message.includes('guideline') || message.includes('rule') || message.includes('tip')) {
      return mushroomKnowledge['safe'];
    }
    if (message.includes('help') || message.includes('what can you')) {
      return mushroomKnowledge['help'];
    }
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! 👋 How can I help you with mushroom safety today? Type **'help'** to see what I can assist with!";
    }
    if (message.includes('thank')) {
      return "You're welcome! 😊 Stay safe and remember - when in doubt about a mushroom, don't eat it! Is there anything else I can help with?";
    }
    if (message.includes('bye') || message.includes('goodbye')) {
      return "Goodbye! 👋 Stay safe out there! Remember to always verify mushroom identifications with experts. Feel free to come back anytime you need help! 🍄";
    }
    
    return mushroomKnowledge['default'];
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      time: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: getBotResponse(input),
        time: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: '🚨 Emergency', query: 'emergency' },
    { label: '☠️ Poisonous', query: 'poisonous' },
    { label: '✅ Edible', query: 'edible' },
    { label: '🔍 Identify', query: 'identify' },
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-container">
        <div className="chat-header">
          <div className="bot-avatar">🤖</div>
          <div className="bot-info">
            <h2>Mushroom Safety Assistant</h2>
            <span className="status">● Online</span>
          </div>
        </div>

        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button 
              key={index}
              className="quick-action-btn"
              onClick={() => setInput(action.query)}
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              {message.type === 'bot' && <div className="message-avatar">🤖</div>}
              <div className="message-content">
                <div className="message-text">
                  {message.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line.includes('**') ? (
                        <span dangerouslySetInnerHTML={{ 
                          __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                        }} />
                      ) : (
                        line
                      )}
                      {i < message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <span className="message-time">{formatTime(message.time)}</span>
              </div>
              {message.type === 'user' && <div className="message-avatar user">👤</div>}
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question about mushrooms..."
          />
          <button className="send-btn" onClick={handleSend}>
            <span>➤</span>
          </button>
        </div>
      </div>

      <div className="chat-sidebar">
        <h3>💡 Quick Tips</h3>
        <div className="tip-card">
          <span className="tip-icon">🚫</span>
          <p>Never eat a mushroom you can't identify with 100% certainty</p>
        </div>
        <div className="tip-card">
          <span className="tip-icon">📸</span>
          <p>Take photos from multiple angles for better identification</p>
        </div>
        <div className="tip-card">
          <span className="tip-icon">🧑‍⚕️</span>
          <p>When in doubt, consult a professional mycologist</p>
        </div>
        <div className="tip-card emergency">
          <span className="tip-icon">🚨</span>
          <p>If poisoning suspected, call emergency services immediately</p>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;