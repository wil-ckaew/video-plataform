// src/pages/users/users.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserCardComponent from '../../components/UserCardComponent';
//import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string | null;
  hashed_password: string; // Adicione este campo
}

const UsersPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users`);
        setUsers(response.data.users || []);
        setError(null); // Clear any previous errors
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`Error fetching data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiUrl]);

  const handleAddUser = () => {
    router.push('/users/add-user');
  };

  const handleEdit = (id: string) => {
    router.push(`/users/edit-user?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${apiUrl}/api/users/${id}`);
        setUsers(users.filter(user => user.id !== id));
        alert('User deleted successfully');
      } catch (error) {
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header /> {/* Adicionar o Header */}
      <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-800 font-semibold">Usuarios</p>
            <button
              onClick={handleAddUser}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add User
            </button>
          </div>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : (
            <div className="space-y-4">
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="p-4 bg-white shadow rounded">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                        <p><strong>Created At:</strong> {new Date(user.created_at || '').toLocaleString()}</p>
                        <p><strong>Hashed Password:</strong> {user.hashed_password}</p>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleEdit(user.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">No users available</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UsersPage;
