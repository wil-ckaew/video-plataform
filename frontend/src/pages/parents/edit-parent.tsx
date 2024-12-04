// src/pages/parents/edit-parent/[id].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig'; // Importa a instância configurada
import { AxiosError } from 'axios';
import Header from '../../components/Header'; // Importa o Header

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

const EditParentPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ name: string; email: string; phone: string }>({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (id) {
      const fetchParent = async () => {
        try {
          const response = await api.get(`/api/parents/${id}`);
          setParent(response.data.parent);
          setFormData({
            name: response.data.parent.name,
            email: response.data.parent.email,
            phone: response.data.parent.phone
          });
          setError(null);
        } catch (error) {
          if (error instanceof AxiosError) {
            setError(`Error fetching parent data: ${error.message}`);
          } else {
            setError('Unknown error occurred');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchParent();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/api/parents/${id}`, formData); // Método PATCH
      alert('Parent updated successfully');
      router.push('/parents/parents'); // Redireciona após a atualização para a URL correta
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Error updating parent: ${error.message}`);
      } else {
        alert('Error updating parent: Unknown error');
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header /> {/* Adiciona o Header */}
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Edit Parent</h1>
        {parent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-gray-700">Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Parent
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default EditParentPage;
