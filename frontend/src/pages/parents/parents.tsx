// src/pages/parents/parents.tsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig'; // Importa a instância configurada
import ParentCardComponent from '../../components/ParentCardComponent';
import Header from '../../components/Header'; // Importa o Header
import { useRouter } from 'next/router';
import { AxiosError } from 'axios'; // Importa AxiosError para manipulação de erros

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

const ParentsPage: React.FC = () => {
  const router = useRouter();

  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/parents');
        setParents(response.data.parents || []);
        setError(null);
      } catch (error) {
        // Verifica se o erro é uma instância de AxiosError
        if (error instanceof AxiosError) {
          setError(`Error fetching parents: ${error.message}`);
        } else {
          setError('Unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddParent = () => {
    router.push('/parents/add-parent'); // Rota para adicionar um pai
  };

  const handleEdit = (id: string) => {
    router.push(`/parents/edit-parent?id=${id}`); // Rota para edição de um pai
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this parent?')) {
      try {
        await api.delete(`/api/parents/${id}`);
        setParents(parents.filter(parent => parent.id !== id));
        alert('Parent deleted successfully');
      } catch (error) {
        if (error instanceof AxiosError) {
          alert(`Error deleting parent: ${error.message}`);
        } else {
          alert('Error deleting parent: Unknown error');
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header /> {/* Adiciona o Header */}
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-800 font-semibold">Parentes</p>
          <button
            onClick={handleAddParent}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Parent
          </button>
        </div>
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="space-y-4">
            {parents.length > 0 ? (
              parents.map((parent) => (
                <ParentCardComponent
                  key={parent.id}
                  parent={parent}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <p className="text-center text-gray-600">No parents available</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ParentsPage;
