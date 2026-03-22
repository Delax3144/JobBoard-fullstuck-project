import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

// 1. Определяем типы для пользователя и ролей
export type UserRole = 'employer' | 'customer';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole; // Ключевое поле!
}

interface AuthContextType {
  user: User | null; // null, если не залогинен
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

// 2. Создаем сам Контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Провайдер, который обернет все приложение
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Эффект для проверки авторизации при загрузке (например, из localStorage/кук)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Сохраняем сессию
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Кастомный хук для удобного использования в компонентах
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};