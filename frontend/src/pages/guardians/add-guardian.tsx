import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface User {
  id: string;
  username: string;
}

const AddGuardianPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    relationship: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${apiUrl}/api/users`)
      .then(res => setUsers(res.data.users))
      .catch(() => setUsers([]));
  }, [apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_id || !formData.name || !formData.relationship) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(`${apiUrl}/api/guardians`, formData);
      alert('Responsável cadastrado com sucesso');
      router.push('/guardians/guardians');
    } catch {
      setError('Erro ao cadastrar responsável');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 bg-gray-100 p-6">
        <section className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-semibold mb-6 text-center">Adicionar Responsável</h1>

          {error && <p className="mb-4 text-red-600 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Usuário</label>
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-green-500"
              >
                <option value="">Selecione o usuário</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Nome do Responsável</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Parentesco</label>
              <input
                type="text"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white font-semibold ${loading ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loading ? 'Salvando...' : 'Adicionar Responsável'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AddGuardianPage;
