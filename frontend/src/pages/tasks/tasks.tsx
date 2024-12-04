import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig'; // Importa a instância configurada
import Header from '../../components/Header'; // Importa o Header
import { useRouter } from 'next/router';
import { AxiosError } from 'axios'; // Certifique-se de importar AxiosError

interface Task {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const TasksPage: React.FC = () => {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/tasks');
        setTasks(response.data.tasks || []);
        setError(null);
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(`Error fetching tasks: ${error.message}`);
        } else {
          setError('Unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddTask = () => {
    router.push('/tasks/add-task'); // Atualize a rota para adicionar uma tarefa
  };

  const handleEdit = (id: string) => {
    router.push(`/tasks/edit-task?id=${id}`); // Atualize a rota para edição de uma tarefa
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/api/tasks/${id}`);
        setTasks(tasks.filter(task => task.id !== id));
        alert('Task deleted successfully');
      } catch (error) {
        if (error instanceof AxiosError) {
          alert(`Error deleting task: ${error.message}`);
        } else {
          alert('Error deleting task: Unknown error');
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header /> {/* Adiciona o Header */}
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-800 font-semibold">Tarefa</p>
          <button
            onClick={handleAddTask}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Task
          </button>
        </div>
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded shadow-sm">
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{task.title}</p>
                    <p className="text-gray-600">{task.content}</p>
                    <p className="text-gray-400 text-sm">Created at: {new Date(task.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(task.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600">No tasks available</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TasksPage;
