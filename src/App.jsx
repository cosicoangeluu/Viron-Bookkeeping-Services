import { ArrowLeft, BookOpen, Briefcase, LogIn, Shield, User, UserPlus } from "lucide-react"; // ✅ Added UserPlus, Eye, EyeOff
import { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/shared/Sidebar";
import "./modal.css";

function App() {
  const [view, setView] = useState("landing"); // landing | login | signup | forgot-password | reset-password | dashboard
  const [userType, setUserType] = useState(null); // client | bookkeeper
  const [dashboardView, setDashboardView] = useState("home");

  // User authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [resetError, setResetError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", confirmPassword: "", name: "" });
  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [resetForm, setResetForm] = useState({ token: "", newPassword: "", confirmPassword: "" });
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordSignup, setShowPasswordSignup] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);



  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    setView("landing");
    setDashboardView("home");
    setLoginForm({ email: "", password: "" });
    setSignupForm({ email: "", password: "", confirmPassword: "", name: "" });
    setForgotForm({ email: "" });
    setResetForm({ token: "", newPassword: "", confirmPassword: "" });
    setLoginError("");
    setSignupError("");
    setForgotError("");
    setResetError("");
  };

  // Expose logout function globally for sidebar
  window.handleLogout = handleLogout;

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      const response = await fetch('https://bookkeeping-backend-pewk.onrender.com/api/login', {
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
      const response = await fetch('https://bookkeeping-backend-pewk.onrender.com/api/signup', {
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

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setForgotError("");

    try {
      const response = await fetch('https://bookkeeping-backend-pewk.onrender.com/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(forgotForm),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Reset token generated: ${data.resetToken}\n\nCopy this token to reset your password.`);
        setView("reset-password");
        setForgotForm({ email: "" });
      } else {
        setForgotError(data.error || 'Failed to send reset request');
      }
    } catch {
      setForgotError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetError("");

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://bookkeeping-backend-pewk.onrender.com/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetForm.token,
          newPassword: resetForm.newPassword,
          confirmPassword: resetForm.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password reset successfully! Please log in with your new password.');
        setView("login");
        setResetForm({ token: "", newPassword: "", confirmPassword: "" });
      } else {
        setResetError(data.error || 'Failed to reset password');
      }
    } catch {
      setResetError('Network error. Please try again.');
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
              type={showPasswordLogin ? "text" : "password"}
              placeholder="Enter your password"
              required
              className="input-field password-input"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPasswordLogin(!showPasswordLogin)}
            >
              {showPasswordLogin ? "Hide" : "Show"}
            </button>
          </div>
          {loginError && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{loginError}</div>}
          <button type="submit" className="btn login flex items-center gap-2" disabled={isLoading}>
            <LogIn className="w-5 h-5" /> {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => setView("forgot-password")}
            className="btn client flex items-center gap-2"
            style={{ marginTop: "0.75rem", backgroundColor: 'transparent', color: '#007bff', textDecoration: 'underline' }}
          >
            Forgot Password?
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
              type={showPasswordSignup ? "text" : "password"}
              placeholder="Password"
              required
              className="input-field password-input"
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPasswordSignup(!showPasswordSignup)}
            >
              {showPasswordSignup ? "Hide" : "Show"}
            </button>
          </div>
          <div className="form-group">
            <input
              type={showPasswordSignup ? "text" : "password"}
              placeholder="Re-enter Password"
              required
              className="input-field password-input"
              value={signupForm.confirmPassword}
              onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPasswordSignup(!showPasswordSignup)}
            >
              {showPasswordSignup ? "Hide" : "Show"}
            </button>
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

  // Forgot Password Page
  const renderForgotPassword = () => (
    <div className="landing">
      <div className="card landing-card">
        <h1 className="title flex items-center gap-2">
          <Shield className="w-6 h-6 text-gray-700" />
          Forgot Password
        </h1>
        <p className="subtitle">Enter your email to receive a password reset token</p>
        <form onSubmit={handleForgotPassword}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="input-field"
              value={forgotForm.email}
              onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
            />
          </div>
          {forgotError && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{forgotError}</div>}
          <button type="submit" className="btn login flex items-center gap-2" disabled={isLoading}>
            <LogIn className="w-5 h-5" /> {isLoading ? 'Sending...' : 'Send Reset Token'}
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

  // Reset Password Page
  const renderResetPassword = () => (
    <div className="landing">
      <div className="card landing-card">
        <h1 className="title flex items-center gap-2">
          <Shield className="w-6 h-6 text-gray-700" />
          Reset Password
        </h1>
        <p className="subtitle">Enter the reset token and your new password</p>
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label className="form-label">Reset Token</label>
            <input
              type="text"
              placeholder="Enter reset token"
              required
              className="input-field"
              value={resetForm.token}
              onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type={showPasswordReset ? "text" : "password"}
              placeholder="Enter new password"
              required
              className="input-field password-input"
              value={resetForm.newPassword}
              onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPasswordReset(!showPasswordReset)}
            >
              {showPasswordReset ? "Hide" : "Show"}
            </button>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type={showPasswordReset ? "text" : "password"}
              placeholder="Confirm new password"
              required
              className="input-field password-input"
              value={resetForm.confirmPassword}
              onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPasswordReset(!showPasswordReset)}
            >
              {showPasswordReset ? "Hide" : "Show"}
            </button>
          </div>
          {resetError && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{resetError}</div>}
          <button type="submit" className="btn login flex items-center gap-2" disabled={isLoading}>
            <LogIn className="w-5 h-5" /> {isLoading ? 'Resetting...' : 'Reset Password'}
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
      {view === "forgot-password" && renderForgotPassword()}
      {view === "reset-password" && renderResetPassword()}
      {view === "dashboard" && currentUser && (
        <div className="dashboard-layout">
          <Sidebar setDashboardView={setDashboardView} userType={userType} />
          <main className="dashboard-main">
            <Dashboard
              userType={userType}
              dashboardView={dashboardView}
              userInfo={currentUser}
              setDashboardView={setDashboardView}
            />

          </main>
        </div>
      )}
    </div>
  );
}

export default App;



