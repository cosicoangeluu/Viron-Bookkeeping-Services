import { useEffect, useRef, useState } from "react";
import "./BookkeeperRequestView.css";

const API_URL = "http://localhost:5000/api";

const BookkeeperRequestView = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const messageBoxRef = useRef(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchMessages();
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
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
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
        body: JSON.stringify({ sender_id: 4, receiver_id: selectedClient.id, message: reply }) // 4 is bookkeeper
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
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender_id === 4 ? "bookkeeper" : "client"}`}
              >
                <div className="text">{msg.message}</div>
                <span className="time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
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
