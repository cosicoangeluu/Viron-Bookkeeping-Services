import { useEffect, useState } from "react";
import "./BookkeeperClientPersonalInfoView.css"; // ✅ CSS file

const API_URL = "http://localhost:5000/api";

const BookkeeperClientPersonalView = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [personalInfo, setPersonalInfo] = useState({});

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchPersonalInfo();
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      const clientUsers = data.filter(user => user.role === 'client');
      setClients(clientUsers);
      if (clientUsers.length > 0) {
        setSelectedClient(clientUsers[0]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchPersonalInfo = async () => {
    if (!selectedClient) return;
    try {
      const response = await fetch(`${API_URL}/personal-info/${selectedClient.id}`);
      const data = await response.json();
      console.log("Bookkeeper fetched personal info:", data);
      setPersonalInfo(data);
    } catch (error) {
      console.error("Error fetching personal info:", error);
      setPersonalInfo({});
    }
  };

  return (
    <div className="bookkeeper-client-view">
      <h2>📋 Client Personal Information</h2>

      <div className="client-content">
        {/* Client List */}
        <div className="client-list">
          <h3>Client List</h3>
          <ul>
            {clients.map((client) => (
              <li
                key={client.id}
                className={selectedClient && selectedClient.id === client.id ? "active" : ""}
                onClick={() => setSelectedClient(client)}
              >
                {client.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Client Details */}
        {selectedClient && (
          <div className="client-details">
            <h3>Details for {selectedClient.name}</h3>
            <table>
              <tbody>
                <tr><th>Full Name</th><td>{personalInfo.full_name || 'Not provided'}</td></tr>
                <tr><th>TIN</th><td>{personalInfo.tin || 'Not provided'}</td></tr>
                <tr><th>Birth Date</th><td>{personalInfo.birth_date || 'Not provided'}</td></tr>
                <tr><th>Place of Birth</th><td>{personalInfo.birth_place || 'Not provided'}</td></tr>
                <tr><th>Citizenship</th><td>{personalInfo.citizenship || 'Not provided'}</td></tr>
                <tr><th>Civil Status</th><td>{personalInfo.civil_status || 'Not provided'}</td></tr>
                <tr><th>Gender</th><td>{personalInfo.gender || 'Not provided'}</td></tr>
                <tr><th>Registered Address</th><td>{personalInfo.address || 'Not provided'}</td></tr>
                <tr><th>Email</th><td>{selectedClient.email}</td></tr>
                <tr><th>Phone Number</th><td>{personalInfo.phone || 'Not provided'}</td></tr>
                <tr><th>Spouse’s Name</th><td>{personalInfo.spouse_name || 'Not provided'}</td></tr>
                <tr><th>Spouse’s TIN</th><td>{personalInfo.spouse_tin || 'Not provided'}</td></tr>
              </tbody>
            </table>

            {/* Dependents Section */}
            {personalInfo.dependents && personalInfo.dependents.length > 0 && (
              <div className="dependents">
                <h4>Dependents</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Birth Date</th>
                      <th>Relationship</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalInfo.dependents.map((dep) => (
                      <tr key={dep.id || `${dep.dep_name}-${dep.dep_birth_date}`}>
                        <td>{dep.dep_name || '—'}</td>
                        <td>{dep.dep_birth_date || '—'}</td>
                        <td>{dep.dep_relationship || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookkeeperClientPersonalView;
