import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [role, setRole] = useState(user?.role);

  const save = async () => {
    const res = await api.patch('/auth/update-profile', { role });
    setUser(res.data.user);
    localStorage.setItem('token', res.data.token); // обновляем токен
    alert("Role updated to " + res.data.user.role);
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Profile Settings</h2>
      <p>Email: {user?.email}</p>
      <div style={{ margin: '20px 0' }}>
        <label style={{ display: "block", marginBottom: 16, fontWeight: 500 }}>Account Type:</label>
        <select className="input" value={role} onChange={e => setRole(e.target.value as any)}>
          <option value="candidate">Candidate</option>
          <option value="employer">Employer</option>
        </select>
      </div>
      <button className="btn btnPrimary" onClick={save}>Save Changes</button>
    </div>
  );
}