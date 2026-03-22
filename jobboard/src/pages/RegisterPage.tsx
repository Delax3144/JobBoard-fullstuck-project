import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type UserRole, useAuth } from '../context/AuthContext';
import api from '../lib/api';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [selectedRole, setSelectedRole] = useState<UserRole>('candidate');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', marginBottom: '15px',
    borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222',
    color: 'white', fontSize: '16px', boxSizing: 'border-box'
  };

  const roleButtonStyle = (role: UserRole): React.CSSProperties => ({
    padding: '10px 25px', borderRadius: '50px', border: '2px solid',
    borderColor: selectedRole === role ? '#38b2ac' : '#555',
    backgroundColor: selectedRole === role ? '#1a202c' : 'transparent',
    color: selectedRole === role ? 'white' : '#aaa',
    cursor: 'pointer', fontWeight: 'bold', marginRight: '10px',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    // 1. Сначала регистрируем пользователя через API напрямую
    const response = await api.post('/auth/register', {
      email: formData.email,
      password: formData.password,
      role: selectedRole // 'employer' или 'candidate' [cite: 1, 2]
    });

    // 2. Если регистрация успешна, вызываем login с данными
    await login(formData.email, formData.password);
    
    navigate('/');
  } catch (error: any) {
    alert(error.response?.data?.message || "Registration failed");
  }
};

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: 'white' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', padding: '30px', borderRadius: '12px', backgroundColor: '#1a1a1a' }}>
        <h2 style={{ textAlign: 'center' }}>Create Account</h2>
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '12px' }}>I want to be a:</label>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="button" style={roleButtonStyle('candidate')} onClick={() => setSelectedRole('candidate')}>Candidate</button>
            <button type="button" style={roleButtonStyle('employer')} onClick={() => setSelectedRole('employer')}>Employer</button>
          </div>
        </div>
        <input type="text" name="name" placeholder="Name" style={inputStyle} value={formData.name} onChange={handleInputChange} required />
        <input type="email" name="email" placeholder="Email" style={inputStyle} value={formData.email} onChange={handleInputChange} required />
        <input type="password" name="password" placeholder="Password" style={inputStyle} value={formData.password} onChange={handleInputChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" style={inputStyle} value={formData.confirmPassword} onChange={handleInputChange} required />
        <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#38b2ac', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;