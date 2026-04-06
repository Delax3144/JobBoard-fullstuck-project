import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { type UserMode } from "../lib/userMode";

export default function TopNav({ mode, setMode }: { mode: UserMode; setMode: (m: UserMode) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [hasInvite, setHasInvite] = useState(false);
  
  // URL бэкенда для загрузки аватарок
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (user) {
      setMode(user.role === 'employer' ? 'employer' : 'candidate');

      const checkUpdates = () => {
        const endpoint = user.role === 'employer' ? '/applications/owner' : '/applications/my';
        api.get(endpoint).then((res: { data: any[] }) => {
          const unread = res.data.some((app: any) => {
            const lastUpdate = app.messages?.[0]?.createdAt || app.createdAt;
            const lastViewed = user.role === 'employer' ? app.lastViewedByOwner : app.lastViewedByCandidate;
            return lastUpdate > lastViewed || (user.role === 'candidate' && app.status === 'invited' && lastUpdate > lastViewed);
          });
          setHasInvite(unread);
        });
      };

      checkUpdates();
      const interval = setInterval(checkUpdates, 15000);
      return () => clearInterval(interval);
    }
  }, [user, setMode, location.pathname]);

  useEffect(() => {
    if (!isLoading && user && user.role === "candidate" && location.pathname.startsWith("/employer")) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

  return (
    <header className="header">
      <div className="headerInner">
        <div className="brand">
          <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 800, fontSize: 22 }}>
            Job<span style={{ color: '#10b981' }}>Board</span>
          </NavLink>
        </div>

        <nav className="nav">
          <NavLink to="/jobs" className="navLink">All Jobs</NavLink>
          
          {/* ССЫЛКИ ТОЛЬКО ДЛЯ КАНДИДАТА */}
          {user?.role === 'candidate' && (
            <>
              <NavLink to="/applications" className="navLink" style={{ display: 'flex', alignItems: 'center' }}>
                My Applications
                {hasInvite && <span className="pulse-dot" style={{
                  width: '8px', height: '8px', backgroundColor: '#10b981',
                  borderRadius: '50%', marginLeft: '8px', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                }} />}
              </NavLink>
              <NavLink to="/saved" className="navLink">Saved Jobs</NavLink>
            </>
          )}

          {/* ССЫЛКИ ТОЛЬКО ДЛЯ РАБОТОДАТЕЛЯ */}
          {user?.role === 'employer' && (
            <NavLink to="/employer" className="navLink" style={{ display: 'flex', alignItems: 'center' }}>
              Employer Console
              {hasInvite && <span className="pulse-dot" style={{
                width: '8px', height: '8px', backgroundColor: '#10b981',
                borderRadius: '50%', marginLeft: '8px', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
              }} />}
            </NavLink>
          )}
        </nav>

        <div className="actions">
          {user ? (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              
              {/* БЛОК: АВАТАР И НИКНЕЙМ */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#111', border: '1px solid #10b981', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {user.avatarUrl ? (
                    <img 
                      src={`${apiUrl}${user.avatarUrl}`} 
                      alt="avatar" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
                      {user.username?.[0].toUpperCase() || user.email[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                  {user.username || user.email.split('@')[0]}
                </span>
              </div>

              {/* КНОПКА MY PROFILE */}
              <NavLink 
                to="/profile" 
                className="btn pill" 
                style={{ border: '1px solid #333', padding: '8px 20px', textDecoration: 'none', color: 'inherit', fontSize: 13 }}
              >
                My Profile
              </NavLink>

              <button className="btn pill" onClick={logout} style={{ border: '1px solid #333', padding: '8px 20px' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <NavLink to="/login" className="navLink">Login</NavLink>
              <NavLink to="/register" className="btn pill btnPrimary" style={{ textDecoration: 'none' }}>Sign Up</NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}