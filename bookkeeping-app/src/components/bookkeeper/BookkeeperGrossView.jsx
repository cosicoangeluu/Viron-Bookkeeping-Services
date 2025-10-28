import { useEffect, useState } from "react";
import "./BookkeeperGrossView.css";

const API_URL = "http://localhost:5000/api";

const BookkeeperGrossView = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [grossRecords, setGrossRecords] = useState([]);


  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchGrossRecords();
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

  const fetchGrossRecords = async () => {
    if (!selectedClient) return;
    try {
      const response = await fetch(`${API_URL}/gross-records/${selectedClient.id}`);
      const data = await response.json();
      setGrossRecords(data);
    } catch (error) {
      console.error("Error fetching gross records:", error);
    }
  };

  return (
    <div className="bookkeeper-container">
      <h2 className="title">Client Gross Records</h2>

      {/* Client Selection */}
      <div className="client-selection">
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
      </div>

      {/* Gross Records Table */}
      {selectedClient && (
        <div className="gross-section">
          <h3 className="client-name">Gross Records for {selectedClient.name}</h3>

          {grossRecords.length > 0 ? (
            <table className="gross-table">
              <thead>
                <tr>
                  <th>Form</th>
                  <th>Month</th>
                  <th>Gross Income</th>
                  <th>Computed Tax</th>
                </tr>
              </thead>
              <tbody>
                {grossRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.form_name}</td>
                    <td>{record.month}</td>
                    <td>₱{record.gross_income.toLocaleString()}</td>
                    <td>
                      ₱{record.computed_tax.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-records">No gross records found for this client.</p>
          )}
        </div>
      )}

      {!selectedClient && (
        <div className="placeholder">
          <p>Select a client to view their gross records.</p>
        </div>
      )}
    </div>
  );
};

export default BookkeeperGrossView;
