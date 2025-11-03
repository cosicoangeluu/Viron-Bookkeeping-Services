import { useEffect, useRef, useState } from "react";
import "./BookkeeperRequestView.css";

const API_URL = "https://bookkeeping-backend-pewk.onrender.com/api";

const BookkeeperRequestView = ({ userInfo }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);
  const messageBoxRef = useRef(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setClients(data.filter(user => user.role === 'client'));
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedClient) return;
    try {
      const response = await fetch(`${API_URL}/messages/${selectedClient.id}`);
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

  const handleReply = async (e) => {
    e.preventDefault();
    const reply = inputRef.current.value.trim();
    if (!reply || !selectedClient) return;

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: userInfo.id, receiver_id: selectedClient.id, message: reply })
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
    <div className="bookkeeper-container">
      <h2 className="title">📁 Client Requests Dashboard</h2>

      {/* Client List */}
      <div className="client-list">
        {clients.map((client) => (
          <button
            key={client.id}
            className={`client-btn ${selectedClient && selectedClient.id === client.id ? "active" : ""}`}
            onClick={() => setSelectedClient(client)}
          >
            👤 {client.name}
          </button>
        ))}
      </div>

      {/* Message View */}
      {selectedClient && (
        <div className="chat-section">
          <h3 className="client-name">Chat with {selectedClient.name}</h3>

          <div ref={messageBoxRef} className="message-box">
            {messages.length === 0 ? (
              <p className="no-messages">No messages yet. Start a conversation below.</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${parseInt(msg.sender_id) === parseInt(userInfo.id) ? "bk-bookkeeper" : "bk-client"}`}
                >
                  <div className="text">{msg.message}</div>
                  <span className="time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))
            )}
          </div>

          {/* Reply Box */}
          <form onSubmit={handleReply} className="input-section">
            <textarea
              ref={inputRef}
              className="input-field"
              rows="3"
              placeholder={`Reply to ${selectedClient.name}...`}
            />
            <button type="submit" className="send-btn">
              Reply
            </button>
          </form>
        </div>
      )}

      {!selectedClient && (
        <div className="placeholder">
          <p>Select a client to view and reply to their messages.</p>
        </div>
      )}
    </div>
  );
};

export default BookkeeperRequestView;
