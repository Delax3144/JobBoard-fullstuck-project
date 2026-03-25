import { BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./lib/api"; //[cite: 16]

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import NotFound from "./pages/NotFound";
import Applications from "./pages/Applications";
import Employer from "./pages/Employer";
import EmployerJob from "./pages/EmployerJob";
import Profile from './pages/Profile'; 
import { AuthProvider, useAuth } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ApplicationDetails from './pages/ApplicationDetails';

import { loadUserMode, saveUserMode, type UserMode } from "./lib/userMode"; //[cite: 16]

function TopNav({ mode, setMode }: { mode: UserMode; setMode: (m: UserMode) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  
  // Состояние для мигающей точки
  const [hasInvite, setHasInvite] = useState(false);

  // Авто-переключение режима при логине/смене роли[cite: 16]
  useEffect(() => {
    if (user) {
      setMode(user.role === 'employer' ? 'employer' : 'candidate'); //[cite: 16]

      // ПРОВЕРКА ПРИГЛАШЕНИЙ: если кандидат, запрашиваем его отклики
      if (user.role === 'candidate') {
        api.get('/applications/my')
          .then((res: { data: any[] }) => {
            const invited = res.data.some((app: any) => app.status === 'invited');
            setHasInvite(invited);
          })
          .catch(() => {});
      }
    }
  }, [user, setMode]);

  // Редирект кандидатов из консоли[cite: 16]
  useEffect(() => {
    if (!isLoading && user && user.role === "candidate" && location.pathname.startsWith("/employer")) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

  // Стили для точки (мигание настраивается в CSS через анимацию pulse)
  const dotStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    display: 'inline-block',
    marginLeft: '8px',
    boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
  };

  return (
    <header className="header">
      <div className="headerInner">
        <div className="brand">
          <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>JobBoard</NavLink>
        </div>

        <nav className="nav">
          <NavLink to="/jobs" className="navLink">All Jobs</NavLink>
          
          {user && (
            <NavLink to="/applications" className="navLink" style={{ display: 'flex', alignItems: 'center' }}>
              My Applications
              {/* Точка появляется только если есть статус invited */}
              {hasInvite && <span style={dotStyle} className="pulse-dot" />}
            </NavLink>
          )}

          {mode === "employer" && (
            <NavLink to="/employer" className="navLink">Employer Console</NavLink>
          )}
        </nav>

        <div className="actions">
          {user ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <NavLink to="/profile" style={{ fontSize: 14, color: '#aaa', textDecoration: 'none' }}>
                {user.email} ({user.role})
              </NavLink>
              <button className="btn pill" onClick={logout} style={{ border: '1px solid #444' }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <NavLink to="/login" className="btn pill" style={{ textDecoration: 'none', border: '1px solid #444' }}>
                Login
              </NavLink>
              <NavLink to="/register" className="btn pill btnPrimary" style={{ textDecoration: 'none' }}>
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="container">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes({ mode }: { mode: UserMode }) {
  return (
    <main className="container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
        {mode === "employer" && <Route path="/employer" element={<PrivateRoute><Employer /></PrivateRoute>} />}
        <Route path="/employer/job/:id" element={<PrivateRoute><EmployerJob /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/applications/:id" element={<ApplicationDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

export default function App() {
  const [mode, setMode] = useState<UserMode>(() => loadUserMode()); //[cite: 16]

  useEffect(() => {
    saveUserMode(mode); //[cite: 16]
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