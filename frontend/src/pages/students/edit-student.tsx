// src/pages/students/edit-student.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface User {
  id: string;
  username: string;
}

interface Parent {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}

interface Student {
  id: string;
  user_id: string;
  parent_id: string | null;
  group_id: string | null;
  name: string;
  email: string | null;
  age: number;
  birth_date?: string | null;
  shirt_size?: string | null;
}

const EditStudentPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();
  const { id } = router.query;

  const [users, setUsers] = useState<User[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [formData, setFormData] = useState({
    user_id: '',
    parent_id: '',
    group_id: '',
    name: '',
    email: '',
    age: '',
    birth_date: '',
    shirt_size: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users`);
        setUsers(res.data.users);
      } catch {
        setUsers([]);
      }
    };

    const fetchParents = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/parents`);
        setParents(res.data.parents);
      } catch {
        setParents([]);
      }
    };

    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/groups`);
        setGroups(res.data.groups);
      } catch {
        setGroups([]);
      }
    };

    fetchUsers();
    fetchParents();
    fetchGroups();
  }, [apiUrl]);

  useEffect(() => {
    if (id) {
      const fetchStudent = async () => {
        try {
          const res = await axios.get(`${apiUrl}/api/students/${id}`);
          const student: Student = res.data.student;
          setFormData({
            user_id: student.user_id,
            parent_id: student.parent_id || '',
            group_id: student.group_id || '',
            name: student.name,
            email: student.email || '',
            age: student.age.toString(),
            birth_date: student.birth_date || '',
            shirt_size: student.shirt_size || '',
          });
          setError(null);
        } catch {
          setError('Erro ao carregar dados do aluno.');
        } finally {
          setLoading(false);
        }
      };

      fetchStudent();
    }
  }, [id, apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_id || !formData.name || !formData.age) {
      setError('Preencha os campos obrigatórios');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        user_id: formData.user_id,
        name: formData.name,
        email: formData.email || null,
        parent_id: formData.parent_id || null,
        group_id: formData.group_id || null,
        age: Number(formData.age),
        birth_date: formData.birth_date || null,
        shirt_size: formData.shirt_size || null,
      };

      await axios.patch(`${apiUrl}/api/students/${id}`, payload);

      alert('Aluno atualizado com sucesso');
      router.push('/students/students');
    } catch {
      setError('Erro ao atualizar aluno');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-gray-100 p-6">
          <p className="text-gray-600 text-lg">Carregando dados do aluno...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-y-auto bg-gray-100 p-6">
        <section className="bg-white max-w-2xl w-full mx-auto p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Editar Aluno</h1>

          {error && (
            <p className="mb-4 text-center text-red-600 font-medium">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="user_id" className="block mb-1 font-medium text-gray-700">Usuário</label>
                <select
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                >
                  <option value="">Selecione um usuário</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="parent_id" className="block mb-1 font-medium text-gray-700">Responsável (opcional)</label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                >
                  <option value="">Selecione um responsável</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => router.push('/parents/add-parent')}
                  className="mt-1 text-sm text-blue-600 hover:underline"
                >
                  Adicionar novo responsável
                </button>
              </div>

              <div>
                <label htmlFor="group_id" className="block mb-1 font-medium text-gray-700">Turma</label>
                <select
                  id="group_id"
                  name="group_id"
                  value={formData.group_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                >
                  <option value="">Selecione a turma</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="shirt_size" className="block mb-1 font-medium text-gray-700">Tamanho da Camisa</label>
                <input
                  type="text"
                  id="shirt_size"
                  name="shirt_size"
                  value={formData.shirt_size}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="P, M, G, GG"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="birth_date" className="block mb-1 font-medium text-gray-700">Data de Nascimento</label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="age" className="block mb-1 font-medium text-gray-700">Idade</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min={1}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-2/3">
                <label htmlFor="name" className="block mb-1 font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                  placeholder="Digite o nome do aluno"
                />
              </div>
              <div className="md:w-1/3">
                <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email (opcional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                  placeholder="Digite o email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3 rounded-md text-white font-semibold ${saving ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} transition`}
            >
              {saving ? 'Salvando...' : 'Atualizar Aluno'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default EditStudentPage;
