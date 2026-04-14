import { BrowserRouter, Route, Routes, useLocation, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google'; // <-- ИМПОРТ ПРОВАЙДЕРА GOOGLE
import api from "./lib/api";

// Импорт страниц
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import NotFound from "./pages/NotFound";
import Applications from "./pages/Applications";
import Employer from "./pages/Employer";
import EmployerJob from "./pages/EmployerJob";
import Profile from './pages/Profile'; 
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ApplicationDetails from './pages/ApplicationDetails';
import MessagesPage from './pages/MessagesPage';
import JobManagement from './pages/JobManagement';
import SavedJobs from "./pages/SavedJobs";

// Импорт компонентов
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";

// Либы
import { loadUserMode, saveUserMode, type UserMode } from "./lib/userMode";

// === КНОПКА ЧАТА ===
function FloatingChatButton() {
  const { user } = useAuth();
  const location = useLocation();
  const [hasNewMsg, setHasNewMsg] = useState(false);

  useEffect(() => {
    if (!user || location.pathname.startsWith("/messages")) {
      setHasNewMsg(false);
      return;
    }

    const checkUpdates = () => {
      const endpoint = user.role === 'employer' ? '/applications/owner' : '/applications/my';
      api.get(endpoint).then((res) => {
        const unread = res.data.some((app: any) => {
          const lastUpdate = app.messages?.[0]?.createdAt || app.createdAt;
          const lastViewed = user.role === 'employer' ? app.lastViewedByOwner : app.lastViewedByCandidate;
          return lastUpdate > lastViewed || (user.role === 'candidate' && app.status === 'invited' && lastUpdate > lastViewed);
        });
        setHasNewMsg(unread);
      }).catch(() => {});
    };

    checkUpdates();
    const interval = setInterval(checkUpdates, 10000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  if (!user || location.pathname.startsWith("/messages")) return null;

  return (
    <Link 
      to="/messages" 
      className={`floating-chat-btn ${hasNewMsg ? 'has-notification' : ''}`}
    >
      💬
      {hasNewMsg && <div className="chat-notification-badge">!</div>}
    </Link>
  );
}

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="container" style={{ color: '#fff', padding: '100px 0' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes({ mode }: { mode: UserMode }) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <main className={isHomePage ? "" : "container"}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
        <Route path="/applications/:id" element={<PrivateRoute><ApplicationDetails /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/messages/:id" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        {mode === "employer" && <Route path="/employer" element={<PrivateRoute><Employer /></PrivateRoute>} />}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/employer/job/:id" element={<JobManagement />} />
        <Route path="/saved" element={<SavedJobs />} />
      </Routes>
    </main>
  );
}

export default function App() {
  const [mode, setMode] = useState<UserMode>(() => loadUserMode());

  useEffect(() => {
    saveUserMode(mode);
  }, [mode]);

  // Берем Google Client ID из .env
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <BrowserRouter>
          <TopNav mode={mode} setMode={setMode} />
          <div className="grid-canvas" style={{ minHeight: '80vh', position: 'relative' }}>
            <AppRoutes mode={mode} />
          </div>
          <Footer />
          <FloatingChatButton />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}