import React, { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig'; // Importa a instância configurada
import { AxiosError } from 'axios';
import Header from '../../components/Header'; // Importa o Header

const AddTaskPage: React.FC = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState<{ title: string; content: string }>({
    title: '',
    content: ''
  });
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/tasks', formData); // Método POST
      alert('Task added successfully');
      router.push('/tasks/tasks'); // Redireciona para a lista de tarefas
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(`Error adding task: ${error.message}`);
      } else {
        setError('Error adding task: Unknown error');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header /> {/* Adiciona o Header */}
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Add Task</h1>
        {error && <p className="text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-gray-700">Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Task
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddTaskPage;
