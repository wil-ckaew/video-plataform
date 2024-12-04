import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig'; // Importa a instância configurada
import { AxiosError } from 'axios';
import Header from '../../components/Header'; // Importa o Header

interface Task {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const EditTaskPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ title: string; content: string }>({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (id) {
      const fetchTask = async () => {
        try {
          const response = await api.get(`/api/tasks/${id}`);
          setTask(response.data.task);
          setFormData({
            title: response.data.task.title,
            content: response.data.task.content
          });
          setError(null);
        } catch (error) {
          if (error instanceof AxiosError) {
            setError(`Error fetching task data: ${error.message}`);
          } else {
            setError('Unknown error occurred');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchTask();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/api/tasks/${id}`, formData); // Método PATCH
      alert('Task updated successfully');
      router.push('/tasks/tasks'); // Redireciona para a URL correta após a atualização
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Error updating task: ${error.message}`);
      } else {
        alert('Error updating task: Unknown error');
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header /> {/* Adiciona o Header */}
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Edit Task</h1>
        {task && (
          <div className="p-4 bg-white border border-gray-300 rounded shadow-sm">
            <p className="text-gray-400 text-sm mb-2">Created at: {new Date(task.created_at).toLocaleString()}</p>
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
                Update Task
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default EditTaskPage;
