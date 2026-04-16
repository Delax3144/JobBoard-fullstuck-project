import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); 
  const { login, googleLogin, githubLogin } = useAuth(); // <-- Достали githubLogin
  const navigate = useNavigate();
  const location = useLocation();

  // Ловим возврат с Гитхаба
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    if (code) {
      // Прячем код из ссылки, чтобы было красиво
      window.history.replaceState({}, document.title, "/login");
      // Проверяем, не сохраняли ли мы роль при регистрации
      const savedRole = localStorage.getItem("github_role") || "candidate";
      
      githubLogin(code, savedRole)
        .then(() => {
          localStorage.removeItem("github_role");
          navigate("/");
        })
        .catch((err) => console.log("Вторая попытка входа отменена (Strict Mode)"));
    }
  }, [location.search, githubLogin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (rememberMe) localStorage.setItem('remembered_email', email);
      navigate("/");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/");
    } catch (err) {
      alert("Google login failed");
    }
  };

  // Клик по GitHub
  const handleGithubClick = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  };

  return (
    <div style={{ padding: '60px 0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '450px', 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '32px', 
        padding: '40px' 
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px', textAlign: 'center' }}>
          Welcome <span style={{ color: '#10b981' }}>Back</span>
        </h1>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>Log in to manage your career</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Email Address</label>
            <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" style={{ background: '#000', border: '1px solid #222' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Password</label>
            <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ background: '#000', border: '1px solid #222' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#888' }}>
              <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} style={{ accentColor: '#10b981' }} /> 
              Remember me
            </label>
            <Link to="/forgot-password" style={{ fontSize: '14px', color: '#10b981', textDecoration: 'none', opacity: 0.8 }}>Forgot Password?</Link>
          </div>

          <button className="btn btnPrimary" type="submit" style={{ padding: '16px', borderRadius: '14px', fontSize: '16px', marginTop: '10px' }}>
            Login to Account
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#222' }}></div>
          <span style={{ padding: '0 15px', color: '#555', fontSize: '12px', fontWeight: 600 }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: '1px', background: '#222' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert('Google login failed')} type="icon" theme="filled_black" shape="circle" size="large" />
          </div>

          <button
            type="button"
            onClick={handleGithubClick}
            style={{
              width: '44px', height: '44px', borderRadius: '50%', background: '#111', border: '1px solid #333',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
            }}
          >
            <svg fill="#fff" viewBox="0 0 24 24" width="24" height="24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '25px', color: '#666', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#10b981', textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}