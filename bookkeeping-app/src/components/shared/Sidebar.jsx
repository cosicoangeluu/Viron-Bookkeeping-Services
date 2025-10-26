import React, { useState } from "react";
import "./Sidebar.css";
import {
  Home,
  FileText,
  BarChart,
  ClipboardList,
  User,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ setDashboardView, userType, dashboardView }) => {
  const [collapsed, setCollapsed] = useState(false);

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
      <div className="sidebar-footer"></div>
    </div>
  );
};

export default Sidebar;
