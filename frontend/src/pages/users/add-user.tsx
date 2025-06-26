// src/pages/users/add-user.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import Header from '../../components/Header';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const AddUserPage: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<{ username: string; password: string; role: string }>({
    username: '',
    password: '',
    role: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      await axios.post(`${apiUrl}/api/users`, {
        username: formData.username,
        password_hash: formData.password,
        role: formData.role
      });
      alert('Usuário adicionado com sucesso!');
      router.push('/users/users');
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || error.message);
      } else {
        setError('Erro desconhecido ao adicionar usuário.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-y-auto bg-gray-100 p-6">
        <section className="bg-white max-w-lg w-full mx-auto p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Adicionar Usuário</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block mb-2 font-medium text-gray-700">
                Usuário
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Digite o nome de usuário"
                required
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
                Senha
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Digite a senha"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="role" className="block mb-2 font-medium text-gray-700">
                Função
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Digite a função do usuário"
                required
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white font-semibold
                          ${loading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                          transition`}
            >
              {loading ? 'Salvando...' : 'Adicionar Usuário'}
            </button>

            {error && <p className="text-center text-red-600 mt-2">{error}</p>}
          </form>
        </section>
      </main>
    </div>
  );
};

export default AddUserPage;

