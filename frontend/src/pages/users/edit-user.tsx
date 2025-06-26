// src/pages/users/edit-user.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import Header from '../../components/Header';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
}

const EditUserPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{ username: string; role: string; password: string }>({
    username: '',
    role: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/users/${id}`);
          if (response.data.status === 'success') {
            setUser(response.data.user);
            setFormData({
              username: response.data.user.username,
              role: response.data.user.role,
              password: '', // senha vazia para edição (senha só será alterada se preenchida)
            });
            setError(null);
          } else {
            setError('Falha ao buscar dados do usuário');
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            setError(`Erro ao buscar usuário: ${error.message}`);
          } else {
            setError('Erro desconhecido ao buscar usuário');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        username: formData.username,
        role: formData.role,
      } as any;

      // Só inclui senha no payload se o usuário digitou algo
      if (formData.password.trim() !== '') {
        payload.password_hash = formData.password;
      }

      await axios.patch(`http://localhost:8080/api/users/${id}`, payload);
      alert('Usuário atualizado com sucesso');
      router.push('/users/users');
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Erro ao atualizar usuário: ${error.message}`);
      } else {
        alert('Erro desconhecido ao atualizar usuário');
      }
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <section className="bg-white max-w-lg w-full mx-auto p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Editar Usuário</h1>
            {user && (
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
                    Senha (deixe em branco para não alterar)
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
                      placeholder="Digite a nova senha"
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
                  className="w-full py-3 rounded-md text-white font-semibold bg-green-600 hover:bg-green-700 transition"
                >
                  Atualizar Usuário
                </button>
              </form>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default EditUserPage;

