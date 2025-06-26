// src/pages/parents/add-parent.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Header';

interface User {
  id: string;
  username: string;
}

const AddParentPage: React.FC = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Busca os usuários do backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data.users);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setError('Erro ao carregar lista de usuários.');
      }
    };

    fetchUsers();
  }, []);

  // Envia o formulário para criar o pai
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userId || !name || !email) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/parents', {
        user_id: userId,
        name,
        email,
      });

      alert('Pai adicionado com sucesso!');
      router.push('/parents/parents');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Erro ao adicionar pai.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-y-auto bg-gray-100 p-6">
        <section className="bg-white max-w-lg w-full mx-auto p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Adicionar Pai</h2>

          {error && (
            <p className="mb-4 text-center text-red-600 font-medium">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Digite o nome do pai"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Digite o email do pai"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="userId" className="block mb-2 font-medium text-gray-700">
                Usuário
              </label>
              <select
                id="userId"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="" disabled>
                  Selecione um usuário
                </option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white font-semibold
                ${loading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                transition`}
            >
              {loading ? 'Salvando...' : 'Adicionar Pai'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AddParentPage;

