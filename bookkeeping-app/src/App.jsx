import { ArrowLeft, BookOpen, Briefcase, LogIn, Shield, User, UserPlus } from "lucide-react"; // ✅ Added UserPlus
import { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/shared/Sidebar";

function App() {
  const [view, setView] = useState("landing"); // landing | login | signup | dashboard
  const [userType, setUserType] = useState(null); // client | bookkeeper
  const [dashboardView, setDashboardView] = useState("home");

  // User authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", confirmPassword: "", name: "" });

  const birDueDates = [
    { date: "Oct 20, 2025", description: "Quarterly VAT Return" },
    { date: "Nov 10, 2025", description: "Monthly Percentage Tax" },
    { date: "Dec 31, 2025", description: "Annual Income Tax Return" },
  ];

  const clientActivity = [
    { description: "Uploaded sales report for August", timestamp: "2 days ago" },
    { description: "Sent request to bookkeeper", timestamp: "1 week ago" },
    { description: "Updated personal information", timestamp: "2 weeks ago" },
  ];

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    setView("landing");
    setDashboardView("home");
    setLoginForm({ email: "", password: "" });
    setSignupForm({ email: "", password: "", confirmPassword: "", name: "" });
    setLoginError("");
    setSignupError("");
  };

  // Expose logout function globally for sidebar
  window.handleLogout = handleLogout;

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUser(data);
        setUserType(data.role);
        setView("dashboard");
        setLoginForm({ email: "", password: "" });
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSignupError("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupForm.email,
          password: signupForm.password,
          role: userType,
          name: signupForm.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUser(data);
        setUserType(data.role);
        setView("dashboard");
        setSignupForm({ email: "", password: "", confirmPassword: "", name: "" });
      } else {
        setSignupError(data.error || 'Signup failed');
      }
    } catch {
      setSignupError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Landing Page
  const renderLanding = () => (
    <div className="landing">
      <div className="card landing-card">
        <BookOpen className="w-12 h-12 text-blue-600" />
        <h1 className="title flex items-center gap-2">
          VIRON BOOKKEEPING SERVICES
        </h1>
        <p className="subtitle">Please select your role to continue</p>
        <div className="btn-group">
          <button
            onClick={() => {
              setUserType("client");
              setView("login");
            }}
            className="btn client flex items-center gap-2"
          >
            <User className="w-5 h-5" /> I’m a Client
          </button>
          <button
            onClick={() => {
              setUserType("bookkeeper");
              setView("login");
            }}
            className="btn bookkeeper flex items-center gap-2"
          >
            <Briefcase className="w-5 h-5" /> I’m a Bookkeeper
          </button>
        </div>
      </div>
    </div>
  );

  // Login Page
  const renderLogin = () => (
    <div className="landing">
      <div className="card landing-card">
        <h1 className="title flex items-center gap-2">
          <Shield className="w-6 h-6 text-gray-700" />
          {userType === "client" ? "Client Login" : "Bookkeeper Login"}
        </h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="input-field"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              required
              className="input-field"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
          </div>
          {loginError && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{loginError}</div>}
          <button type="submit" className="btn login flex items-center gap-2" disabled={isLoading}>
            <LogIn className="w-5 h-5" /> {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => setView("signup")}
            className="btn client flex items-center gap-2"
            style={{ marginTop: "0.75rem" }}
          >
            <UserPlus className="w-5 h-5" /> Create Account
          </button>
          <button
            type="button"
            onClick={() => setView("landing")}
            className="btn back flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </form>
      </div>
    </div>
  );

  // Signup Page
  const renderSignup = () => (
    <div className="landing">
      <div className="card landing-card">
        <h1 className="title flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-gray-700" />
          {userType === "client" ? "Create Client Account" : "Create Bookkeeper Account"}
        </h1>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Full Name"
              required
              className="input-field"
              value={signupForm.name}
              onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              required
              className="input-field"
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              required
              className="input-field"
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Re-enter Password"
              required
              className="input-field"
              value={signupForm.confirmPassword}
              onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
            />
          </div>
          {signupError && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{signupError}</div>}
          <button type="submit" className="btn login flex items-center gap-5" disabled={isLoading}>
            <UserPlus className="w-9 h-5" /> {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={() => setView("login")}
            className="btn back flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Login
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {view === "landing" && renderLanding()}
      {view === "login" && renderLogin()}
      {view === "signup" && renderSignup()}
      {view === "dashboard" && currentUser && (
        <div className="dashboard-layout">
          <Sidebar setDashboardView={setDashboardView} userType={userType} />
          <main className="dashboard-main">
            <Dashboard
              userType={userType}
              dashboardView={dashboardView}
              clientInfo={currentUser}
              birDueDates={birDueDates}
              clientActivity={clientActivity}
              setDashboardView={setDashboardView}
            />

          </main>
        </div>
      )}
    </div>
  );
}

export default App;



