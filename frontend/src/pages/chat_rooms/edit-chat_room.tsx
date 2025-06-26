import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Header';

interface ChatRoom {
  id: string;
  name: string;
  is_group: boolean;
  created_at?: string;
}

const EditChatRoomPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    name: '',
    is_group: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchChatRoom = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/chat_rooms/${id}`);
        const room = res.data.chat_room;
        setFormData({
          name: room.name || '',
          is_group: room.is_group || false,
        });
        setError(null);
      } catch (err) {
        setError('Failed to fetch chat room data');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRoom();
  }, [id, apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !formData.name) {
      setError('Name is required');
      return;
    }

    try {
      await axios.patch(`${apiUrl}/api/chat_rooms/${id}`, formData);
      alert('Chat room updated successfully');
      router.push('/chat_rooms/chat_rooms');
    } catch (err) {
      setError('Error updating chat room');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto bg-gray-100 p-4 max-w-md mx-auto w-full">
          <h1 className="text-xl font-semibold mb-4">Edit Chat Room</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                Name
              </label>
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
              <label htmlFor="is_group" className="text-gray-700">
                Is Group Chat
              </label>
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Chat Room
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default EditChatRoomPage;

