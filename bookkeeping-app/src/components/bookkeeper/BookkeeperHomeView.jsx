import { CheckCircle, Clock, FileText, MessageSquare, Users } from "lucide-react"; // ✅ icons
import { useEffect, useState } from "react";
import "./BookkeeperHomeView.css";

const API_URL = "http://localhost:5000/api";

const BookkeeperHomeView = () => {
  const [stats, setStats] = useState({ total_clients: 0, total_documents: 0, total_messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/home-stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="bookkeeper-home">
      {/* Header */}
      <div className="bookkeeper-header">
        <h2>
          Welcome, <span className="highlight">Bookkeeper</span> 📊
        </h2>
        <div className="bookkeeper-date">
          <Clock className="icon" />
          <span>Today: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <Users className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.total_clients}</h3>
            <p>Total Clients</p>
          </div>
        </div>
        <div className="stat-card">
          <FileText className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.total_documents}</h3>
            <p>Total Documents</p>
          </div>
        </div>
        <div className="stat-card">
          <MessageSquare className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.total_messages}</h3>
            <p>Total Messages</p>
          </div>
        </div>
      </div>

      {/* Connected Cards */}
      <div className="bookkeeper-grid">
        {/* Pending Tasks */}
        <div className="bookkeeper-card card-purple">
          <div className="card-header">
            <Clock className="icon text-purple" />
            <h3>Pending Client Tasks</h3>
          </div>
          <ul className="bookkeeper-list">
            <li>Review client uploaded receipts</li>
            <li>Prepare quarterly VAT filings</li>
            <li>Respond to client requests</li>
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="bookkeeper-card card-indigo">
          <div className="card-header">
            <CheckCircle className="icon text-indigo" />
            <h3>Recent Activity</h3>
          </div>
          <ul className="bookkeeper-list">
            <li>Processed client documents</li>
            <li>Sent filing reminders</li>
            <li>Updated client records</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookkeeperHomeView;
