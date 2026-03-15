import { BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import NotFound from "./pages/NotFound";
import Applications from "./pages/Applications";
import Employer from "./pages/Employer";
import EmployerJob from "./pages/EmployerJob";

import { loadUserMode, saveUserMode, type UserMode } from "./lib/userMode";

function TopNav({ mode, setMode }: { mode: UserMode; setMode: (m: UserMode) => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  // если переключили на candidate и были в /employer — выкидываем на главную
  useEffect(() => {
    if (mode === "candidate" && location.pathname.startsWith("/employer")) {
      navigate("/", { replace: true });
    }
  }, [mode, location.pathname, navigate]);

  return (
    <header className="header">
      <div className="headerInner">
        <div className="brand">JobBoard</div>

        <nav className="nav">
          <NavLink
            to="/"
            className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
          >
            Home
          </NavLink>

          <NavLink
            to="/jobs"
            className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
          >
            Jobs
          </NavLink>

          <NavLink
            to="/applications"
            className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
          >
            Applications
          </NavLink>

          {mode === "employer" ? (
            <NavLink
              to="/employer"
              className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
            >
              Employer
            </NavLink>
          ) : null}
        </nav>

        <div className="row" style={{ gap: 8 }}>
          <button
            className={`btn pill ${mode === "candidate" ? "btnPrimary" : ""}`}
            onClick={() => setMode("candidate")}
          >
            Candidate
          </button>
          <button
            className={`btn pill ${mode === "employer" ? "btnPrimary" : ""}`}
            onClick={() => setMode("employer")}
          >
            Employer
          </button>
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

        {mode === "employer" ? <Route path="/employer" element={<Employer />} /> : null}

        <Route path="*" element={<NotFound />} />
        <Route path="/employer/job/:id" element={<EmployerJob />} />
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
    <BrowserRouter>
      <TopNav mode={mode} setMode={setMode} />
      <AppRoutes mode={mode} />
    </BrowserRouter>
  );
}