// frontend/src/pages/groups/edit-group.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Header';

const EditGroupPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (id) {
      fetchGroup();
    }
  }, [id]);

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`/api/groups/${id}`);
      const group = response.data.group;
      setFormData({
        name: group.name || '',
        description: group.description || '',
      });
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.patch(`/api/groups/${id}`, {
        name: formData.name.trim() !== '' ? formData.name : null,
        description: formData.description.trim() !== '' ? formData.description : null,
      });
      router.push('/groups/groups');
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div>
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-600">
          Carregando dados do grupo...
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Grupo</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Grupo
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
              placeholder="Digite o nome do grupo"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
              placeholder="Digite uma descrição opcional..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupPage;

