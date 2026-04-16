import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [showPassword, setShowPassword] = useState(false); 
  const [username, setUsername] = useState(""); 
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState(""); 
  const [phone, setPhone] = useState(""); 
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // <-- Стейт для успешной регистрации

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError("Passwords do not match!"); return; }
    setIsSubmitting(true);
    try {
      await register({ email, password, username, firstName, lastName, phone, role });
      setIsSuccess(true); // <-- Показываем сообщение вместо редиректа
    } catch (err: any) {
      const message = err.response?.data?.message || "";
      if (message.includes("email")) setError("This email is already registered. Try logging in?");
      else if (message.includes("username")) setError("Username is already taken. Try another one.");
      else setError("Registration failed. Check your data.");
    } finally { setIsSubmitting(false); }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential, role);
      navigate("/");
    } catch (err) { setError("Google Registration failed."); }
  };

  const handleGithubClick = () => {
    localStorage.setItem("github_role", role);
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  };

  return (
    <div style={{ padding: '40px 0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px' }}>
        
        {isSuccess ? (
          // БЛОК УСПЕХА
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>✉️</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '15px' }}>Check your inbox!</h2>
            <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '16px' }}>
              We've sent a verification link to <br/><b style={{ color: '#10b981' }}>{email}</b>.<br/><br/>
              Please click the link to activate your account.
            </p>
            <Link to="/login" className="btn btnPrimary" style={{ display: 'inline-block', marginTop: '30px', padding: '14px 30px', borderRadius: '14px' }}>
              Go to Login
            </Link>
          </div>
        ) : (
          // БЛОК ФОРМЫ (Остался таким же)
          <>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px', textAlign: 'center' }}>Create <span style={{ color: '#10b981' }}>Account</span></h1>
            <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>Join our professional community</p>

            {error && <div style={{ background: 'rgba(255, 75, 75, 0.1)', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '10px' }}>I am a:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setRole("candidate")} style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #222', background: role === 'candidate' ? '#10b981' : '#000', color: role === 'candidate' ? '#000' : '#fff', fontWeight: '600' }}>Candidate</button>
                <button type="button" onClick={() => setRole("employer")} style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #222', background: role === 'employer' ? '#10b981' : '#000', color: role === 'employer' ? '#000' : '#fff', fontWeight: '600' }}>Employer</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign up failed')} type="icon" theme="filled_black" shape="circle" size="large" />
              </div>
              <button type="button" onClick={handleGithubClick} style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#111', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                <svg fill="#fff" viewBox="0 0 24 24" width="24" height="24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}><div style={{ flex: 1, height: '1px', background: '#222' }}></div><span style={{ padding: '0 15px', color: '#555', fontSize: '12px', fontWeight: 600 }}>OR EMAIL REGISTER</span><div style={{ flex: 1, height: '1px', background: '#222' }}></div></div>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>First Name *</label><input className="input" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" style={{ background: '#000', border: '1px solid #222', width: '100%' }} /></div>
                <div><label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Last Name *</label><input className="input" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" style={{ background: '#000', border: '1px solid #222', width: '100%' }} /></div>
              </div>
              <div><label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Username *</label><input className="input" required value={username} onChange={e => setUsername(e.target.value)} placeholder="johndoe77" style={{ background: '#000', border: '1px solid #222', width: '100%' }} /></div>
              <div><label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Email Address *</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" style={{ background: '#000', border: '1px solid #222', width: '100%' }} /></div>
              <div><label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Phone Number (Optional)</label><input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+48 123 456 789" style={{ background: '#000', border: '1px solid #222', width: '100%' }} /></div>
              <div>
                <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ background: '#000', border: '1px solid #222', width: '100%', paddingRight: '45px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px' }}>{showPassword ? "👁️" : "🙈"}</button>
                </div>
              </div>
              <div><label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Confirm Password *</label><input className="input" type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ background: '#000', border: password && confirmPassword ? (password === confirmPassword ? '1px solid #10b981' : '1px solid #ff4b4b') : '1px solid #222', width: '100%' }} /></div>
              <button className="btn btnPrimary" type="submit" disabled={isSubmitting} style={{ padding: '16px', borderRadius: '14px', fontSize: '16px', marginTop: '10px', opacity: isSubmitting ? 0.5 : 1 }}>{isSubmitting ? "Creating Account..." : "Create Account"}</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '25px', color: '#666', fontSize: '14px' }}>Already have an account? <Link to="/login" style={{ color: '#10b981', textDecoration: 'none' }}>Login</Link></p>
          </>
        )}
      </div>
    </div>
  );
}