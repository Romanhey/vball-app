import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '../stores/rootStore';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm = observer(({ onSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const authStore = useAuthStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const validate = (): boolean => {
    setLocalError(null);
    
    if (!email.trim()) {
      setLocalError('Email обязателен');
      return false;
    }
    
    if (!email.includes('@')) {
      setLocalError('Некорректный email');
      return false;
    }
    
    if (!name.trim()) {
      setLocalError('Имя обязательно');
      return false;
    }
    
    if (name.trim().length < 2) {
      setLocalError('Имя должно содержать минимум 2 символа');
      return false;
    }
    
    if (!password) {
      setLocalError('Пароль обязателен');
      return false;
    }
    
    if (password.length < 6) {
      setLocalError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    
    if (password !== passwordRepeat) {
      setLocalError('Пароли не совпадают');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      await authStore.register(email, name.trim(), password, passwordRepeat);
      onSuccess?.();
    } catch (error) {
      // Error is handled by authStore
      setLocalError(authStore.error || 'Ошибка регистрации');
    }
  };

  const error = localError || authStore.error;

  return (
    <div className="min-h-screen bg-[#ECE6F0] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-[#1D1B20] mb-6 text-center">Регистрация</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#49454F] mb-2">
              Имя
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#79747E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
              placeholder="Ваше имя"
              disabled={authStore.isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#49454F] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-[#79747E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
              placeholder="your@email.com"
              disabled={authStore.isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#49454F] mb-2">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[#79747E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
              placeholder="••••••••"
              disabled={authStore.isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="passwordRepeat" className="block text-sm font-medium text-[#49454F] mb-2">
              Повторите пароль
            </label>
            <input
              id="passwordRepeat"
              type="password"
              value={passwordRepeat}
              onChange={(e) => setPasswordRepeat(e.target.value)}
              className="w-full px-4 py-2 border border-[#79747E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65558F] focus:border-transparent"
              placeholder="••••••••"
              disabled={authStore.isLoading}
            />
          </div>
          
          {error && (
            <div className="bg-[#B3261E]/10 border border-[#B3261E] text-[#B3261E] px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={authStore.isLoading}
            className="w-full bg-[#65558F] text-white py-3 rounded-lg font-medium hover:bg-[#54477A] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authStore.isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        {onSwitchToLogin && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[#65558F] hover:underline text-sm"
            >
              Уже есть аккаунт? Войти
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
