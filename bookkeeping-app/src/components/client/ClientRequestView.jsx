import { useEffect, useRef, useState } from "react";
import "./ClientRequestView.css";

const API_URL = "http://localhost:5000/api";

const ClientRequestView = ({ clientInfo }) => {
  const messageBoxRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientInfo.id) {
      fetchMessages();
    }
  }, [clientInfo.id]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/messages/${clientInfo.id}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = inputRef.current.value.trim();
    if (!message) return;

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: clientInfo.id, receiver_id: 4, message }) // 4 is bookkeeper
      });

      if (response.ok) {
        inputRef.current.value = "";
        inputRef.current.focus();
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="request-container">
      <h2 className="title">💬 Message Your Bookkeeper</h2>

      <div ref={messageBoxRef} className="message-box">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start a conversation below.</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender_id === clientInfo.id ? 'client' : 'bookkeeper'}`}
            >
              <div className="text">{msg.message}</div>
              <span className="time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-section">
        <textarea
          ref={inputRef}
          className="input-field"
          rows="3"
          placeholder="Type your message or request here..."
        />
        <button type="submit" className="send-btn">
          Send
        </button>
      </form>
    </div>
  );
};

export default ClientRequestView;
