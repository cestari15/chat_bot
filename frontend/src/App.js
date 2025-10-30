import React, { useState, useEffect } from "react";
import axios from "axios";
import { Send, Plus, MessageCircle, Sun, Moon, Bot } from "lucide-react"; 
import "./App.css";

// Função para buscar o tema inicial do localStorage
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  return savedTheme || "light"; 
};

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme); 

  useEffect(() => {
    document.body.className = `${theme}-mode`;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // ✅ Funções de API mantidas intactas
  const fetchConversations = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/conversations");
      setConversations(res.data);
      if (res.data.length > 0) {
        selectConversation(res.data[0]);
      } else {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Erro ao buscar conversas:", err);
    }
  };

  const createNewConversation = async () => {
    const title = newConversationTitle.trim() || "Nova Conversa";
    try {
      const res = await axios.post("http://127.0.0.1:8000/conversations", { title });
      setConversations((prev) => [res.data, ...prev]);
      setNewConversationTitle("");
      await selectConversation(res.data);
    } catch (err) {
      console.error("Erro ao criar conversa:", err.response || err);
      alert("Erro ao criar conversa. Verifique o console para detalhes.");
    }
  };

  const selectConversation = async (conversation) => {
    if (!conversation || !conversation.id) {
      setSelectedConversation(null);
      setMessages([]);
      return;
    }
    setSelectedConversation(conversation);

    try {
      const res = await axios.get(`http://127.0.0.1:8000/messages/${conversation.id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err.response || err);
      setMessages([]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedConversation) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    const userMsg = { user: "Você", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        message: userMessage,
        conversation_id: selectedConversation.id,
      });

      const aiMessage = { user: "Bot", content: res.data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err.response || err);
      const errorMessage = { user: "Bot", content: "❌ Erro ao enviar. Tente novamente." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------
  // INÍCIO DO RETURN (Renderização)
  // --------------------------------------------------------
  return (
    <div className="app-container">
      {/* Barra lateral - Mantida */}
      <div className="sidebar">
        <div className="sidebar-header">
            <h2>Conversas</h2>
            <button onClick={toggleTheme} className="theme-toggle-button">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
        </div>
        <div className="input-group">
          <input
            type="text"
            className="title-input" 
            value={newConversationTitle}
            onChange={(e) => setNewConversationTitle(e.target.value)}
            placeholder="Título da conversa"
          />
          <button onClick={createNewConversation} className="add-button"> 
            <Plus size={18} />
          </button>
        </div>
        <div className="conversation-list">
          {conversations.length === 0 && <p>Nenhuma conversa</p>}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                selectedConversation?.id === conv.id ? "selected" : ""
              }`}
              onClick={() => selectConversation(conv)}
            >
              {conv.title}
            </div>
          ))}
        </div>
      </div>

      {/* Área principal de chat */}
      <div className="chat-area">
        <div className="header">
            {selectedConversation ? selectedConversation.title : "Chat Gemini"}
        </div>
        
        {/* Placeholder para Início - Mantido */}
        {!selectedConversation && (
            <div className="messages no-conversation">
                <MessageCircle size={64} style={{ marginBottom: '20px' }} />
                <h3>Bem-vindo ao Chat Gemini!</h3>
                <p>Crie uma nova conversa ou selecione uma existente na barra lateral para começar a interagir.</p>
            </div>
        )}

        {/* Mensagens e Formulário de Chat */}
        {selectedConversation && (
            <>
                {/* Container de mensagens */}
                <div className="messages">
                {messages.map((m, i) => (
                    // Alterado: Removemos o bot-avatar e o wrapper para mensagens do bot
                    <div
                    key={i}
                    className={`message-wrapper ${m.user === "Você" ? "user-wrapper" : "bot-wrapper"}`}
                    >
                        {/* Remove o avatar do bot daqui */}
                        <div className={`message ${m.user === "Você" ? "user" : "bot"}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {/* Indicador de carregamento */}
                {loading && (
                    <div className="message-wrapper bot-wrapper loading-wrapper">
                        {/* Remove o avatar do bot daqui */}
                        <div className="message bot typing-indicator">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                )}
                </div>

                {/* Formulário de Input - NOVO LAYOUT AQUI */}
                <form onSubmit={sendMessage} className="message-form">
                    <div className="input-container"> {/* Novo container para posicionamento */}
                        {/* Ícone do Bot adicionado aqui, dentro do container do input */}
                        <div className="input-prefix">
                            <Bot size={20} />
                        </div>
                        <input
                            type="text"
                            className="message-input" 
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            disabled={loading}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="send-button"
                        disabled={loading || !inputMessage.trim()}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </>
        )}
      </div>
    </div>
  );
}

export default App;