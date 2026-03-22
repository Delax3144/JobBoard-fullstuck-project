import { BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import NotFound from "./pages/NotFound";
import Applications from "./pages/Applications";
import Employer from "./pages/Employer";
import EmployerJob from "./pages/EmployerJob";
import { AuthProvider, useAuth } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';

import { loadUserMode, saveUserMode, type UserMode } from "./lib/userMode";

function TopNav({ mode, setMode }: { mode: UserMode; setMode: (m: UserMode) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Авто-переключение режима при логине
  useEffect(() => {
    if (user) {
      setMode(user.role === 'employer' ? 'employer' : 'candidate');
    }
  }, [user, setMode]);

  useEffect(() => {
    if (mode === "candidate" && location.pathname.startsWith("/employer")) {
      navigate("/", { replace: true });
    }
  }, [mode, location.pathname, navigate]);

  return (
    <header className="header">
      <div className="headerInner">
        <div className="brand">
          <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>JobBoard</NavLink>
        </div>

        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>Home</NavLink>
          <NavLink to="/jobs" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>Jobs</NavLink>
          <NavLink to="/applications" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>Applications</NavLink>
          {mode === "employer" && (
            <NavLink to="/employer" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>Employer</NavLink>
          )}
        </nav>

        <div className="row" style={{ gap: 12, alignItems: 'center' }}>
          {!user && (
            <div className="row" style={{ gap: 8, borderRight: '1px solid #333', paddingRight: 12 }}>
              <button className={`btn pill ${mode === "candidate" ? "btnPrimary" : ""}`} onClick={() => setMode("candidate")}>Candidate</button>
              <button className={`btn pill ${mode === "employer" ? "btnPrimary" : ""}`} onClick={() => setMode("employer")}>Employer</button>
            </div>
          )}

          {user ? (
            <div className="row" style={{ gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#aaa' }}>{user.name} ({user.role})</span>
              <button className="btn pill" onClick={logout} style={{ border: '1px solid #444' }}>Logout</button>
            </div>
          ) : (
            <NavLink to="/register" className="btn pill btnPrimary" style={{ textDecoration: 'none' }}>Sign Up</NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

function AppRoutes({ mode }: { mode: UserMode }) {
  return (
    <main className="container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/applications" element={<Applications />} />
        {mode === "employer" && <Route path="/employer" element={<Employer />} />}
        <Route path="/employer/job/:id" element={<EmployerJob />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

export default function App() {
  const [mode, setMode] = useState<UserMode>(() => loadUserMode());

  useEffect(() => {
    saveUserMode(mode);
  }, [mode]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <TopNav mode={mode} setMode={setMode} />
        <AppRoutes mode={mode} />
      </BrowserRouter>
    </AuthProvider>
  );
}