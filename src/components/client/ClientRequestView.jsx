import { useEffect, useRef, useState } from "react";
import "./ClientRequestView.css";

const API_URL = "https://bookkeeping-backend-pewk.onrender.com/api";

const ClientRequestView = ({ clientInfo }) => {
  const messageBoxRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [bookkeeperId, setBookkeeperId] = useState(null);

  useEffect(() => {
    if (clientInfo.id) {
      fetchBookkeeper();
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [clientInfo.id]);

  const fetchBookkeeper = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const users = await response.json();
      const bookkeeper = users.find(u => u.role === 'bookkeeper');
      if (bookkeeper) setBookkeeperId(bookkeeper.id);
    } catch (error) {
      console.error('Error fetching bookkeeper:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/messages/${clientInfo.id}`);
      const data = await response.json();
      setMessages(data);
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        if (messageBoxRef.current) {
          messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error fetching messages:", error);
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
        body: JSON.stringify({ sender_id: clientInfo.id, receiver_id: bookkeeperId || 4, message })
      });

      if (response.ok) {
        inputRef.current.value = "";
        inputRef.current.focus();
        fetchMessages(); // Refresh messages immediately
        // Scroll to bottom after sending
        setTimeout(() => {
          if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
          }
        }, 100);
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
              className={`message ${parseInt(msg.sender_id) === parseInt(clientInfo.id) ? 'client' : 'bookkeeper'}`}
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
