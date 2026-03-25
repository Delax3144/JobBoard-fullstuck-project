import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', marginBottom: '15px',
    borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222',
    color: 'white', fontSize: '16px', boxSizing: 'border-box'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error: any) {
      alert("Invalid email or password");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: 'white' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', padding: '30px', borderRadius: '12px', backgroundColor: '#1a1a1a' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Login</h2>
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          style={inputStyle} 
          value={formData.email} 
          onChange={handleInputChange} 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          style={inputStyle} 
          value={formData.password} 
          onChange={handleInputChange} 
          required 
        />
        
        <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#38b2ac', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>
          Sign In
        </button>

        <div style={{ textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
          Don't have an account? <NavLink to="/register" style={{ color: '#38b2ac', textDecoration: 'none' }}>Register</NavLink>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;