import React, { useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

const AddChatRoomPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    is_group: false,
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError('Name is required');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        is_group: formData.is_group,
      };

      await axios.post(`${apiUrl}/api/chat_rooms`, payload);

      alert('Chat room added successfully');
      router.push('/chat_rooms/chat_rooms');
    } catch (err) {
      setError('Error adding chat room');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto bg-gray-100 p-4 max-w-md mx-auto w-full">
          <h1 className="text-xl font-semibold mb-4">Add Chat Room</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_group"
                name="is_group"
                checked={formData.is_group}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="is_group" className="text-gray-700">Is Group?</label>
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Chat Room
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AddChatRoomPage;
