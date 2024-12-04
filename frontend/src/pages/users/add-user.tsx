// src/pages/users/add-user.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Header';
//import Sidebar from '../../components/Sidebar';
import { AxiosError } from 'axios';

const AddUserPage: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<{ username: string; role: string }>({
    username: '',
    role: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', formData); // Método POST para adicionar um usuário
      alert('User added successfully');
      router.push('/users/users'); // Redireciona após a adição
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Error adding user: ${error.message}`);
      } else {
        alert('Error adding user: Unknown error');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <h1 className="text-xl font-semibold mb-4">Add User</h1>
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
              Add User
            </button>
          </form>
          {error && <p className="text-red-600 mt-4">{error}</p>}
        </main>
      </div>
    </div>
  );
};

export default AddUserPage;
