import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import "./BookkeeperClientAccountsView.css";

const API_URL = "https://bookkeeping-backend-pewk.onrender.com/api";

const BookkeeperClientAccountsView = () => {
  const [clients, setClients] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    fetchClients();
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchClients, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/client-accounts`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching client accounts:", error);
    }
  };

  const togglePasswordVisibility = (clientId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  return (
    <div className="bookkeeper-client-accounts-view">
      <h2>👥 Client Accounts Management</h2>

      <div className="accounts-content">
        <div className="accounts-info">
          <p>View and manage all client account credentials. Passwords are hidden by default for security.</p>
          <p className="update-note">🔄 Auto-updates every 30 seconds to reflect password/email changes.</p>
        </div>

        <div className="accounts-table-container">
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>
                    <div className="password-cell">
                      <span className={visiblePasswords[client.id] ? "" : "password-hidden"}>
                        {visiblePasswords[client.id] ? (client.plain_password || "Password not set") : "••••••••"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="password-toggle-btn"
                      onClick={() => togglePasswordVisibility(client.id)}
                      title={visiblePasswords[client.id] ? "Hide Password" : "Show Password"}
                    >
                      {visiblePasswords[client.id] ? (
                        <>
                          <EyeOff size={16} />
                          <span style={{ marginLeft: '0.5rem' }}>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye size={16} />
                          <span style={{ marginLeft: '0.5rem' }}>View</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clients.length === 0 && (
          <div className="no-clients">
            <p>No client accounts found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookkeeperClientAccountsView;
