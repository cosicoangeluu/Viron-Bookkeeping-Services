import { ArrowLeft, BookOpen, Briefcase, Eye, EyeOff, Loader2, Lock, LogIn, Mail, Shield, User, UserPlus } from "lucide-react";
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
        <div className="landing-header-icon">
          <BookOpen className="w-16 h-16 text-blue-500" />
        </div>
        <h1 className="title">
          VIRON BOOKKEEPING SERVICES
        </h1>
        <p className="subtitle">Choose your role to get started</p>
        <div className="role-selection-cards">
          <div
            onClick={() => {
              setUserType("client");
              setView("login");
            }}
            className="role-card client-role"
          >
            <div className="role-icon">
              <User className="w-8 h-8" />
            </div>
            <h3 className="role-card-title">I'm a Client</h3>
            <p className="role-card-description">Access your financial records and manage your bookkeeping</p>
          </div>
          <div
            onClick={() => {
              setUserType("bookkeeper");
              setView("login");
            }}
            className="role-card bookkeeper-role"
          >
            <div className="role-icon">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="role-card-title">I'm a Bookkeeper</h3>
            <p className="role-card-description">Manage client accounts and provide professional services</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Login Page
  const renderLogin = () => (
    <div className="landing">
      <div className="card landing-card">
        <div style={{ marginBottom: "1.75rem" }}>
          <Shield className="w-12 h-12" style={{ color: "#8b5cf6", margin: "0 auto", display: "block", marginBottom: "0.875rem" }} />
          <h1 className="title">
            Welcome Back
          </h1>
          <p className="subtitle">
            {userType === "client" ? "Sign in to access your financial records" : "Sign in to manage your clients"}
          </p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              className="input-field"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPasswordLogin ? "text" : "password"}
                placeholder="Enter your password"
                required
                className="input-field"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPasswordLogin(!showPasswordLogin)}
              >
                {showPasswordLogin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <button
              type="button"
              onClick={() => setView("forgot-password")}
              className="link-btn"
            >
              Forgot Password?
            </button>
          </div>
          {loginError && <div className="error-message">{loginError}</div>}
          <button type="submit" className="btn login flex items-center gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="divider">OR</div>
          <div className="button-group">
            <button
              type="button"
              onClick={() => setView("signup")}
              className="btn back flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" /> Create New Account
            </button>
            <button
              type="button"
              onClick={() => setView("landing")}
              className="btn back flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Helper function to calculate password strength
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 1, label: 'Weak', color: '#ef4444' };
    if (strength <= 3) return { strength: 2, label: 'Fair', color: '#f59e0b' };
    if (strength <= 4) return { strength: 3, label: 'Good', color: '#10b981' };
    return { strength: 4, label: 'Strong', color: '#10b981' };
  };

  // Signup Page
  const renderSignup = () => {
    const passwordStrength = getPasswordStrength(signupForm.password);

    return (
      <div className="landing">
        <div className="card landing-card">
          <div style={{ marginBottom: "1.75rem" }}>
            <UserPlus className="w-12 h-12" style={{ color: "#8b5cf6", margin: "0 auto", display: "block", marginBottom: "0.875rem" }} />
            <h1 className="title">
              Create Account
            </h1>
            <p className="subtitle">
              {userType === "client" ? "Join us to manage your finances" : "Start managing clients professionally"}
            </p>
          </div>
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                required
                className="input-field"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                className="input-field"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPasswordSignup ? "text" : "password"}
                  placeholder="Create a strong password"
                  required
                  className="input-field"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPasswordSignup(!showPasswordSignup)}
                >
                  {showPasswordSignup ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {signupForm.password && (
                <div className="password-strength">
                  <div className="password-strength-bar">
                    <div
                      className="password-strength-fill"
                      style={{
                        width: `${(passwordStrength.strength / 4) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <span className="password-strength-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPasswordSignup ? "text" : "password"}
                  placeholder="Re-enter your password"
                  required
                  className="input-field"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPasswordSignup(!showPasswordSignup)}
                >
                  {showPasswordSignup ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {signupError && <div className="error-message">{signupError}</div>}
            <button type="submit" className="btn login flex items-center gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            <div className="divider">OR</div>
            <button
              type="button"
              onClick={() => setView("login")}
              className="btn back flex items-center gap-2"
              style={{ marginTop: 0 }}
            >
              <LogIn className="w-5 h-5" /> Sign In to Existing Account
            </button>
            <button
              type="button"
              onClick={() => setView("landing")}
              className="btn back flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Forgot Password Page
  const renderForgotPassword = () => (
    <div className="landing">
      <div className="card landing-card">
        <div style={{ marginBottom: "1.75rem" }}>
          <Lock className="w-12 h-12" style={{ color: "#8b5cf6", margin: "0 auto", display: "block", marginBottom: "0.875rem" }} />
          <h1 className="title">
            Forgot Password?
          </h1>
          <p className="subtitle">
            No worries! Enter your email and we'll send you a reset token
          </p>
        </div>
        <form onSubmit={handleForgotPassword}>
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              className="input-field"
              value={forgotForm.email}
              onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
            />
          </div>
          {forgotError && <div className="error-message">{forgotError}</div>}
          <button type="submit" className="btn login flex items-center gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            {isLoading ? 'Sending...' : 'Send Reset Token'}
          </button>
          <div className="divider">OR</div>
          <div className="button-group">
            <button
              type="button"
              onClick={() => setView("login")}
              className="btn back flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Login
            </button>
            <button
              type="button"
              onClick={() => setView("landing")}
              className="btn back flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Reset Password Page
  const renderResetPassword = () => (
    <div className="landing">
      <div className="card landing-card">
        <div style={{ marginBottom: "1.75rem" }}>
          <Shield className="w-12 h-12" style={{ color: "#8b5cf6", margin: "0 auto", display: "block", marginBottom: "0.875rem" }} />
          <h1 className="title">
            Reset Password
          </h1>
          <p className="subtitle">
            Enter the reset token and create a new secure password
          </p>
        </div>
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Reset Token
            </label>
            <input
              type="text"
              placeholder="Paste your reset token here"
              required
              className="input-field"
              value={resetForm.token}
              onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <Lock className="w-4 h-4" />
              New Password
            </label>
            <div className="password-input-container">
              <input
                type={showPasswordReset ? "text" : "password"}
                placeholder="Create a new password"
                required
                className="input-field"
                value={resetForm.newPassword}
                onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPasswordReset(!showPasswordReset)}
              >
                {showPasswordReset ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm New Password
            </label>
            <div className="password-input-container">
              <input
                type={showPasswordReset ? "text" : "password"}
                placeholder="Re-enter your new password"
                required
                className="input-field"
                value={resetForm.confirmPassword}
                onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPasswordReset(!showPasswordReset)}
              >
                {showPasswordReset ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {resetError && <div className="error-message">{resetError}</div>}
          <button type="submit" className="btn login flex items-center gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
          <div className="divider">OR</div>
          <button
            type="button"
            onClick={() => setView("login")}
            className="btn back flex items-center gap-2"
            style={{ marginTop: 0 }}
          >
            <ArrowLeft className="w-5 h-5" /> Back to Login
          </button>
          <button
            type="button"
            onClick={() => setView("landing")}
            className="btn back flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Home
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



