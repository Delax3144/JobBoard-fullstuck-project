import React, { useState } from 'react';
import { type UserRole, useAuth } from '../context/AuthContext';
// import styles from './RegisterPage.module.css'; // Рекомендую CSS Modules!

const RegisterPage = () => {
  const { login } = useAuth(); // Берем функцию логина из контекста

  // Стейт для данных формы
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Стейт для выбора РОЛИ (по умолчанию Customer)
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

  // Глобальные стили для инпутов (как у тебя в коде)
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    marginBottom: '15px',
    borderRadius: '8px',
    border: '1px solid #444',
    backgroundColor: '#222',
    color: 'white',
    fontSize: '16px',
    boxSizing: 'border-box', // Важно для padding!
  };

  // Стили для кнопок выбора роли (ТЕ САМЫЕ ОВАЛЫ!)
  const roleButtonStyle = (role: UserRole): React.CSSProperties => ({
    padding: '10px 25px',
    borderRadius: '50px',
    border: '2px solid',
    borderColor: selectedRole === role ? '#38b2ac' : '#555', // Бирюзовый если выбран
    backgroundColor: selectedRole === role ? '#1a202c' : 'transparent',
    color: selectedRole === role ? 'white' : '#aaa',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    marginRight: '10px',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Тут будет логика отправки на Бэкенд!
    console.log('Регистрация:', { ...formData, role: selectedRole });

    // Имитация успешной регистрации и логина
    login({
      id: '123',
      name: formData.name,
      email: formData.email,
      role: selectedRole,
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: 'white' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', padding: '30px', borderRadius: '12px', backgroundColor: '#1a1a1a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
        
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Создать аккаунт</h2>
        <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '30px' }}>Найди работу мечты или идеального сотрудника</p>

        {/* --- ВЫБОР РОЛИ --- */}
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>Я хочу быть:</label>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="button" style={roleButtonStyle('customer')} onClick={() => setSelectedRole('customer')}>
              Соискателем
            </button>
            <button type="button" style={roleButtonStyle('employer')} onClick={() => setSelectedRole('employer')}>
              Работодателем
            </button>
          </div>
        </div>
        {/* ----------------- */}

        <input type="text" name="name" placeholder="Твое Имя" style={inputStyle} value={formData.name} onChange={handleInputChange} required />
        <input type="email" name="email" placeholder="Email" style={inputStyle} value={formData.email} onChange={handleInputChange} required />
        <input type="password" name="password" placeholder="Пароль" style={inputStyle} value={formData.password} onChange={handleInputChange} required />
        <input type="password" name="confirmPassword" placeholder="Подтверди пароль" style={inputStyle} value={formData.confirmPassword} onChange={handleInputChange} required />

        <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#38b2ac', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;