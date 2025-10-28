import {
  BarChart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Settings,
  User,
  X
} from "lucide-react";
import { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ setDashboardView, userType, dashboardView }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const menuItems = [
    { id: "home", label: "Home", icon: <Home className="icon" /> },
    { id: "documents", label: "Documents", icon: <FileText className="icon" /> },
    {
      id: "gross",
      label: userType === "client" ? "My Gross" : "Client Gross",
      icon: <BarChart className="icon" />,
    },
    { id: "request", label: "Requests", icon: <ClipboardList className="icon" /> },
  ];

  if (userType === "client") {
    menuItems.push({
      id: "personal",
      label: "Personal Info",
      icon: <User className="icon" />,
    });
  } else if (userType === "bookkeeper") {
    menuItems.push({
      id: "clientPersonal",
      label: "Clients Personal Info",
      icon: <User className="icon" />,
    });
  }

  return (
    <div
      className={`sidebar ${
        collapsed ? "collapsed" : ""
      } ${userType === "client" ? "sidebar-client" : "sidebar-bookkeeper"}`}
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!collapsed && (
          <>
            <h2 className="sidebar-title">
              {userType === "client" ? "Client Panel" : "Bookkeeper Panel"}
            </h2>
          </>
        )}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setDashboardView(item.id)}
                className={`sidebar-btn ${
                  dashboardView === item.id ? "active" : ""
                }`}
                title={collapsed ? item.label : ""} // Tooltip when collapsed
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => setDashboardView("calendar")}
              className={`sidebar-btn ${
                dashboardView === "calendar" ? "active" : ""
              }`}
              title={collapsed ? "Calendar" : ""}
            >
              <Calendar className="icon" />
              {!collapsed && <span>Calendar</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => setDashboardView("settings")}
              className={`sidebar-btn ${
                dashboardView === "settings" ? "active" : ""
              }`}
              title={collapsed ? "Settings" : ""}
            >
              <Settings className="icon" />
              {!collapsed && <span>Settings</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer Logout */}
      <div className="sidebar-footer">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="sidebar-btn logout-btn"
          title={collapsed ? "Logout" : ""}
        >
          <LogOut className="icon" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-header">
              <h3>Confirm Logout</h3>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="logout-modal-close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="logout-modal-body">
              <p>Are you sure you want to logout?</p>
            </div>
            <div className="logout-modal-footer">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  setShowSuccessModal(true);
                  setTimeout(() => {
                    setShowSuccessModal(false);
                    window.handleLogout();
                  }, 1500);
                }}
                className="btn btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-modal-body">
              <div className="success-icon">✓</div>
              <h3>Logged Out Successfully</h3>
              <p>You have been logged out of your account.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
