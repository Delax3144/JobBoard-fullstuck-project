import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    api.post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div style={{ padding: '100px 0', textAlign: 'center', minHeight: '80vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0f0f0f', padding: '50px', borderRadius: '32px', border: '1px solid #1a1a1a', maxWidth: '400px', width: '100%' }}>
        
        {status === "loading" && (
          <div>
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>⏳</div>
            <h2 style={{ fontSize: '24px' }}>Verifying...</h2>
            <p style={{ color: '#888', marginTop: '10px' }}>Please wait a moment.</p>
          </div>
        )}
        
        {status === "success" && (
          <div>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ color: '#10b981', fontSize: '28px', marginBottom: '10px' }}>Email Verified!</h2>
            <p style={{ color: '#aaa', marginBottom: '30px', lineHeight: '1.5' }}>Your account is now active. You can log in and start using JobBoard.</p>
            <Link to="/login" className="btn btnPrimary" style={{ padding: '14px 30px', borderRadius: '14px', display: 'inline-block' }}>Go to Login</Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>❌</div>
            <h2 style={{ color: '#ff4b4b', fontSize: '28px', marginBottom: '10px' }}>Verification Failed</h2>
            <p style={{ color: '#aaa', marginBottom: '30px', lineHeight: '1.5' }}>The link is invalid, expired, or your email is already verified.</p>
            <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>Return to Login</Link>
          </div>
        )}

      </div>
    </div>
  );
}