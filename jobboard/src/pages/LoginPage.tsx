import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google"; // <-- ИМПОРТ GOOGLE

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); 
  const { login, googleLogin } = useAuth(); // <-- ДОСТАЛИ googleLogin
  const navigate = useNavigate();

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

  // ОБРАБОТЧИК ДЛЯ GOOGLE
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/");
    } catch (err) {
      alert("Google login failed");
    }
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
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)} 
                style={{ accentColor: '#10b981' }} 
              /> 
              Remember me
            </label>
            <Link to="/forgot-password" style={{ fontSize: '14px', color: '#10b981', textDecoration: 'none', opacity: 0.8 }}>Forgot Password?</Link>
          </div>

          <button className="btn btnPrimary" type="submit" style={{ padding: '16px', borderRadius: '14px', fontSize: '16px', marginTop: '10px' }}>
            Login to Account
          </button>
        </form>

        {/* --- GOOGLE БЛОК --- */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#222' }}></div>
          <span style={{ padding: '0 15px', color: '#555', fontSize: '12px', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#222' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert('Google login failed')}
            theme="filled_black"
            shape="pill"
            text="continue_with"
            width="100%"
          />
        </div>
        {/* --- КОНЕЦ GOOGLE БЛОКА --- */}

        <p style={{ textAlign: 'center', marginTop: '25px', color: '#666', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#10b981', textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}