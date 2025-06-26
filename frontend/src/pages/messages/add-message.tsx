import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface ChatRoom {
  id: string;
  name: string;
}

interface User {
  id: string;
  username: string;
}

const AddMessagePage: React.FC = () => {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    room_id: '',
    sender_id: '',
    content: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${apiUrl}/api/chat_rooms`).then(res => setRooms(res.data.chat_rooms));
    axios.get(`${apiUrl}/api/users`).then(res => setUsers(res.data.users));
  }, [apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content || !formData.room_id || !formData.sender_id) {
      setError('All fields are required.');
      return;
    }

    try {
      await axios.post(`${apiUrl}/api/messages`, formData);
      router.push('/messages/messages');
    } catch {
      setError('Failed to add message');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 bg-gray-100 p-4 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold mb-4">Add Message</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select name="room_id" value={formData.room_id} onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="">Select Room</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select name="sender_id" value={formData.sender_id} onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="">Select Sender</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>

          <input
            type="text"
            name="content"
            placeholder="Message content"
            value={formData.content}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          {error && <p className="text-red-600">{error}</p>}

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddMessagePage;
