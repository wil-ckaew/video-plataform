// frontend/src/pages/messages/new-message.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface User {
  id: string;
  username: string;
}

const NewMessagePage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users`);
        setUsers(res.data.users);
      } catch {
        setUsers([]);
      }
    };
    fetchUsers();
  }, [apiUrl]);

  const handleCreateChat = async () => {
    if (!selectedUserId) {
      setError('Select a user to chat with');
      return;
    }

    try {
      const res = await axios.post(`${apiUrl}/api/chat_rooms`, { user_id: selectedUserId });
      router.push(`/messages/chat?id=${res.data.chat_room.id}`);
    } catch {
      setError('Failed to create chat room');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <main className="flex flex-1 flex-col max-w-md mx-auto w-full p-4">
        <h1 className="text-2xl font-bold mb-6">New Message</h1>

        <label className="block mb-4">
          <span className="text-gray-700 font-semibold mb-2 block">Select User</span>
          <select
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select a user</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        </label>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          onClick={handleCreateChat}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
        >
          Create Chat
        </button>
      </main>
    </div>
  );
};

export default NewMessagePage;
