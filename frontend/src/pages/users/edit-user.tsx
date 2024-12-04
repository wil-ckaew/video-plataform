// src/pages/users/edit-user.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Header';
//import Sidebar from '../../components/Sidebar';
import { AxiosError } from 'axios';

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
  const [formData, setFormData] = useState<{ username: string; role: string }>({
    username: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          console.log(`Fetching user with ID: ${id}`); // Adicione este log
          const response = await axios.get(`http://localhost:8080/api/users/${id}`);
          console.log('User fetched:', response.data); // Adicione este log
          if (response.data.status === 'success') {
            setUser(response.data.user); // Certifique-se de que a resposta tem a propriedade `user`
            setFormData({
              username: response.data.user.username,
              role: response.data.user.role
            });
            setError(null);
          } else {
            setError('Failed to fetch user data');
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            setError(`Error fetching user data: ${error.message}`);
          } else {
            setError('Unknown error occurred');
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
      await axios.patch(`http://localhost:8080/api/users/${id}`, formData); // Método PATCH
      alert('User updated successfully');
      router.push('/users/users'); // Redireciona após a atualização
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Error updating user: ${error.message}`);
      } else {
        alert('Error updating user: Unknown error');
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <h1 className="text-xl font-semibold mb-4">Edit User</h1>
          {user && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-gray-700">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-gray-700">Role</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Update User
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default EditUserPage;
