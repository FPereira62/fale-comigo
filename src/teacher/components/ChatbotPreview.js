import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

const ChatbotPreview = ({ config = {} }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const defaultConfig = {
    theme: 'Conversation générale',
    role: 'assistant',
    personnalite: 'amical',
    niveau: 'A1',
    correction_style: 'immédiate',
    aide_niveau: 'modéré'
  };

  const activeConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR';

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInputText(text);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
    setIsListening(!isListening);
  };

  const handleSend = () => {
    if (inputText.trim()) {
      setMessages(prev => [...prev, { 
        type: 'user', 
        content: inputText 
      }]);

      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'bot',
          content: `Je suis un ${activeConfig.role} ${activeConfig.personnalite}. Je vais t'aider avec ${activeConfig.theme}.`
        }]);
      }, 1000);

      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="preview-container">
      <div className="preview-header">
        <h2>Prévisualisation du Chatbot</h2>
        <p className="preview-config">
          Configuration actuelle : {activeConfig.theme} (Niveau {activeConfig.niveau})
        </p>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="input-container">
        <button
          onClick={toggleListening}
          className={`voice-button ${isListening ? 'listening' : ''}`}
          title={isListening ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
        >
          {isListening ? <MicOff className="icon" /> : <Mic className="icon" />}
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Écrivez votre message..."
          className="message-input"
        />
        <button
          onClick={handleSend}
          className="send-button"
          title="Envoyer le message"
        >
          <Send className="icon" />
        </button>
      </div>
    </div>
  );
};

export default ChatbotPreview;
