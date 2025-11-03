import { Bell, CheckCircle, Clock, FileText, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import "./ClientHomeView.css"; // import custom CSS

const API_URL = "https://bookkeeping-backend-pewk.onrender.com/api";

const ClientHomeView = ({ clientInfo }) => {
  const [userStats, setUserStats] = useState({ documents: 0, messages: 0, gross_records: 0 });
  const [loading, setLoading] = useState(true);
  const [clientActivity, setClientActivity] = useState([]);
  const [quickReminders, setQuickReminders] = useState([]);

  useEffect(() => {
    if (clientInfo.id) {
      fetchUserStats();
      fetchActivities();
      fetchQuickReminders();
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

      // Calculate total documents across all forms
      const totalDocuments = Object.values(docs).reduce((total, formDocs) => total + formDocs.length, 0);

      setUserStats({
        documents: totalDocuments,
        messages: msgs.length,
        gross_records: gross.length
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };



  const fetchActivities = async () => {
    try {
      // Fetch user activities
      const activityResponse = await fetch(`${API_URL}/user-activities/${clientInfo.id}`);
      const activities = await activityResponse.json();

      // Filter for only gross record additions and personal info changes
      const filteredActivities = activities
        .filter(activity =>
          activity.description.toLowerCase().includes('gross') ||
          activity.description.toLowerCase().includes('personal') ||
          activity.description.toLowerCase().includes('info')
        )
        .map(activity => ({
          description: activity.description,
          timestamp: new Date(activity.timestamp).toLocaleDateString()
        }));

      setClientActivity(filteredActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchQuickReminders = async () => {
    try {
      // Fetch government due dates for quick reminders
      const response = await fetch(`${API_URL}/due-dates/${clientInfo.id}`);
      const data = await response.json();

      let reminders = [];

      // Add government due dates that are today or within 5 days from now
      if (data.dueDates && data.dueDates.length > 0) {
        const now = new Date();
        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(now.getDate() + 5);

        const upcomingGovDueDates = data.dueDates
          .filter(due => {
            const dueDate = new Date(due.dueDate);
            return dueDate >= now && dueDate <= fiveDaysFromNow;
          })
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .map(due => ({
            type: 'due-date',
            agency: due.agency,
            description: due.description,
            dueDate: new Date(due.dueDate).toLocaleDateString()
          }));

        reminders = reminders.concat(upcomingGovDueDates);
      }

      // Check for unread messages from bookkeeper
      const messagesResponse = await fetch(`${API_URL}/messages/${clientInfo.id}`);
      const messages = await messagesResponse.json();

      // Filter for unread messages from bookkeeper (assuming bookkeeper role)
      const unreadBookkeeperMessages = messages.filter(msg =>
        msg.receiver_id === clientInfo.id &&
        msg.sender_role === 'bookkeeper' &&
        // For simplicity, consider all recent messages as "unread" - in a real app you'd track read status
        new Date(msg.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      );

      if (unreadBookkeeperMessages.length > 0) {
        reminders.push({
          type: 'message',
          agency: 'Bookkeeper',
          description: `You have ${unreadBookkeeperMessages.length} new message${unreadBookkeeperMessages.length > 1 ? 's' : ''} from your bookkeeper`,
          dueDate: 'Check messages'
        });
      }

      setQuickReminders(reminders);
    } catch (error) {
      console.error("Error fetching quick reminders:", error);
      // No fallback reminders
      setQuickReminders([]);
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
        {/* Quick Reminders */}
        <div className="client-card card-blue">
          <div className="card-header">
            <Bell className="icon text-blue" />
            <h3>Quick Reminders</h3>
          </div>
          <div className="card-body">
            {quickReminders.length > 0 ? (
              quickReminders.map((reminder, index) => (
                <div key={index} className={`card-item ${reminder.type === 'message' ? 'green-hover' : 'blue-hover'}`}>
                  <Bell className={`icon ${reminder.type === 'message' ? 'text-green' : 'text-blue'}`} />
                  <div>
                    <p><strong>{reminder.agency}:</strong> {reminder.description}</p>
                    <span className="timestamp">{reminder.type === 'message' ? reminder.dueDate : `Due: ${reminder.dueDate}`}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="card-item blue-hover">
                <Bell className="icon text-blue" />
                <div>
                  <p>No upcoming due dates or messages</p>
                  <span className="timestamp">Check calendar for details</span>
                </div>
              </div>
            )}
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
