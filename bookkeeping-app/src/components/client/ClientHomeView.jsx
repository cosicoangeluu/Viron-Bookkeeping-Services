import { Bell, Calendar, CheckCircle, Clock, FileText, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import "./ClientHomeView.css"; // import custom CSS

const API_URL = "http://localhost:5000/api";

const ClientHomeView = ({ clientInfo, birDueDates, clientActivity }) => {
  const [userStats, setUserStats] = useState({ documents: 0, messages: 0, gross_records: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientInfo.id) {
      fetchUserStats();
    }
  }, [clientInfo.id]);

  const fetchUserStats = async () => {
    try {
      const [docsRes, msgsRes, grossRes] = await Promise.all([
        fetch(`${API_URL}/documents/${clientInfo.id}`),
        fetch(`${API_URL}/messages/${clientInfo.id}`),
        fetch(`${API_URL}/gross-records/${clientInfo.id}`)
      ]);

      const docs = await docsRes.json();
      const msgs = await msgsRes.json();
      const gross = await grossRes.json();

      setUserStats({
        documents: Object.keys(docs).length,
        messages: msgs.length,
        gross_records: gross.length
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="client-home-container">
      {/* Header */}
      <div className="client-home-header">
        <h2>
          Welcome, <span className="highlight">{clientInfo.name}</span> 👋
        </h2>
        <div className="client-home-date">
          <Clock className="icon" />
          <span>Today: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <FileText className="stat-icon" />
          <div className="stat-content">
            <h3>{userStats.documents}</h3>
            <p>My Documents</p>
          </div>
        </div>
        <div className="stat-card">
          <MessageSquare className="stat-icon" />
          <div className="stat-content">
            <h3>{userStats.messages}</h3>
            <p>Messages</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon" />
          <div className="stat-content">
            <h3>{userStats.gross_records}</h3>
            <p>Gross Records</p>
          </div>
        </div>
      </div>

      {/* Connected Cards */}
      <div className="client-home-grid">
        {/* Reminders */}
        <div className="client-card card-blue">
          <div className="card-header">
            <Bell className="icon text-blue" />
            <h3>Quick Reminders</h3>
          </div>
          <div className="card-body">
            {birDueDates.slice(0, 2).map((item, index) => (
              <div key={index} className="card-item blue-hover">
                <Calendar className="icon text-blue" />
                <p>
                  <span className="bold">{item.date}:</span> {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="client-card card-green">
          <div className="card-header">
            <CheckCircle className="icon text-green" />
            <h3>Your Recent Activity</h3>
          </div>
          <div className="card-body">
            {clientActivity.map((item, index) => (
              <div key={index} className="card-item green-hover">
                <CheckCircle className="icon text-green" />
                <div>
                  <p>{item.description}</p>
                  <span className="timestamp">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHomeView;
