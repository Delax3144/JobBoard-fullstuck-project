import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google"; // <-- ИМПОРТ GOOGLE

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

  const { register, googleLogin } = useAuth(); // <-- ДОСТАЛИ googleLogin
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ email, password, username, firstName, lastName, phone, role });
      navigate("/");
    } catch (err: any) {
      const message = err.response?.data?.message || "";
      if (message.includes("email")) {
        setError("This email is already registered. Try logging in?");
      } else if (message.includes("username")) {
        setError("Username is already taken. Try another one.");
      } else {
        setError("Registration failed. Check your data.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ОБРАБОТЧИК ДЛЯ GOOGLE (Передаем выбранную роль!)
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential, role);
      navigate("/");
    } catch (err) {
      setError("Google Registration failed.");
    }
  };

  return (
    <div style={{ padding: '40px 0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '520px', 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '32px', 
        padding: '40px' 
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px', textAlign: 'center' }}>
          Create <span style={{ color: '#10b981' }}>Account</span>
        </h1>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>Join our professional community</p>

        {error && (
          <div style={{ 
            background: 'rgba(255, 75, 75, 0.1)', 
            border: '1px solid #ff4b4b', 
            color: '#ff4b4b', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* ВЫБОР РОЛИ (Сделал повыше, чтобы он влиял и на Google) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '10px' }}>I am a:</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => setRole("candidate")} style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #222', background: role === 'candidate' ? '#10b981' : '#000', color: role === 'candidate' ? '#000' : '#fff', fontWeight: '600' }}>Candidate</button>
            <button type="button" onClick={() => setRole("employer")} style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #222', background: role === 'employer' ? '#10b981' : '#000', color: role === 'employer' ? '#000' : '#fff', fontWeight: '600' }}>Employer</button>
          </div>
        </div>

        {/* --- GOOGLE БЛОК --- */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign up failed')}
            theme="filled_black"
            shape="pill"
            text="signup_with"
            width="100%"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#222' }}></div>
          <span style={{ padding: '0 15px', color: '#555', fontSize: '12px', fontWeight: 600 }}>OR REGISTER WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: '#222' }}></div>
        </div>
        {/* --- КОНЕЦ GOOGLE БЛОКА --- */}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>First Name *</label>
              <input className="input" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" style={{ background: '#000', border: '1px solid #222', width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Last Name *</label>
              <input className="input" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" style={{ background: '#000', border: '1px solid #222', width: '100%' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Username *</label>
            <input className="input" required value={username} onChange={e => setUsername(e.target.value)} placeholder="johndoe77" style={{ background: '#000', border: '1px solid #222', width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Email Address *</label>
            <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" style={{ background: '#000', border: '1px solid #222', width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Phone Number (Optional)</label>
            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+48 123 456 789" style={{ background: '#000', border: '1px solid #222', width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Password *</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="input" 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{ background: '#000', border: '1px solid #222', width: '100%', paddingRight: '45px' }} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px'
                }}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Confirm Password *</label>
            <input 
              className="input" 
              type={showPassword ? "text" : "password"} 
              required 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              placeholder="••••••••" 
              style={{ 
                background: '#000', 
                border: password && confirmPassword ? (password === confirmPassword ? '1px solid #10b981' : '1px solid #ff4b4b') : '1px solid #222', 
                width: '100%' 
              }} 
            />
          </div>

          <button 
            className="btn btnPrimary" 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              padding: '16px', borderRadius: '14px', fontSize: '16px', marginTop: '10px',
              opacity: isSubmitting ? 0.5 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', color: '#666', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#10b981', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}