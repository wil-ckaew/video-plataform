// Arquivo: src/pages/groups/add-group.tsx
import React, { useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

const AddGroupPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('O nome do grupo é obrigatório.');
      return;
    }

    try {
      await axios.post(`${apiUrl}/api/groups`, {
        name,
        description: description.trim() || null,
      });

      alert('Grupo criado com sucesso!');
      router.push('/groups/groups');
    } catch (error: any) {
      console.error('Erro ao criar grupo:', error);
      alert(
        error.response?.data?.message ||
          'Erro ao criar grupo. Verifique o console para detalhes.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Adicionar Grupo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Turma</label>
            <select
              className="mt-1 block w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            >
              <option value="">-- Selecione --</option>
              <option value="pequenos">Pequenos</option>
              <option value="medios">Médios</option>
              <option value="grandes">Grandes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Descrição (opcional)</label>
            <textarea
              className="mt-1 block w-full border rounded px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Digite uma descrição se desejar"
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Salvar
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddGroupPage;

