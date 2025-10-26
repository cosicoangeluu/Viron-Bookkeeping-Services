import "./Dashboard.css";

import ClientDocumentsView from "./client/ClientDocumentsView";
import ClientGrossView from "./client/ClientGrossView";
import ClientHomeView from "./client/ClientHomeView";
import ClientPersonalInfoView from "./client/ClientPersonalInfoView";
import ClientRequestView from "./client/ClientRequestView";

import BookkeeperClientPersonalInfoView from "./bookkeeper/BookkeeperClientPersonalInfoView";
import BookkeeperDocumentsView from "./bookkeeper/BookkeeperDocumentsView";
import BookkeeperGrossView from "./bookkeeper/BookkeeperGrossView";
import BookkeeperHomeView from "./bookkeeper/BookkeeperHomeView";
import BookkeeperRequestView from "./bookkeeper/BookkeeperRequestView";


import CalendarView from "./shared/CalendarView";
import SettingsView from "./shared/SettingsView";

const Dashboard = ({ userType, dashboardView, clientInfo, birDueDates, clientActivity }) => {
  const renderView = () => {
    switch (dashboardView) {
      case "home":
        return userType === "client"
          ? <ClientHomeView clientInfo={clientInfo} birDueDates={birDueDates} clientActivity={clientActivity}/>
          : <BookkeeperHomeView />;
      case "documents":
        return userType === "client" ? <ClientDocumentsView clientInfo={clientInfo} /> : <BookkeeperDocumentsView />;
      case "gross":
        return userType === "client" ? <ClientGrossView clientInfo={clientInfo} /> : <BookkeeperGrossView />;
      case "request":
        return userType === "client" ? <ClientRequestView clientInfo={clientInfo} /> : <BookkeeperRequestView />;
      case "personal":
        return <ClientPersonalInfoView clientInfo={clientInfo} />;
      case "clientPersonal":
        return <BookkeeperClientPersonalInfoView />;
      case "calendar":
        return <CalendarView />;
      case "settings":
        return <SettingsView />;
      default:
        return userType === "client"
          ? <ClientHomeView clientInfo={clientInfo} birDueDates={birDueDates} clientActivity={clientActivity}/>
          : <BookkeeperHomeView />;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1>{userType === "client" ? "Client Dashboard" : "Bookkeeper Dashboard"}</h1>
        <p className="dashboard-subtitle">
          {userType === "client"
            ? "Manage your documents, requests, and personal info"
            : "Monitor client records, requests, and personal info"}
        </p>
      </div>
      <div className="dashboard-content animate-fade">{renderView()}</div>
    </div>
  );
};

export default Dashboard;
