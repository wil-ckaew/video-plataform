import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface ChatRoom {
  id: string;
  name: string | null;
  is_group: boolean;
  created_at?: string;
}

const ChatRoomCard: React.FC<{
  room: ChatRoom;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ room, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">{room.name || '(No Name)'}</h2>
      <p>Type: {room.is_group ? 'Group' : 'Private'}</p>
      <p>Created: {room.created_at || 'N/A'}</p>
      <div className="mt-2 space-x-2">
        <button
          onClick={() => onEdit(room.id)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(room.id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const ChatRoomsPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/chat_rooms`);
        setRooms(response.data.chat_rooms);
        setError(null);
      } catch (err) {
        setError('Error fetching chat rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [apiUrl]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Chat Rooms</h1>
          <button
            onClick={() => router.push('/chat_rooms/add-chat-room')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Chat Room
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : rooms.length === 0 ? (
          <p className="text-center text-gray-600">No chat rooms found.</p>
        ) : (
          <div className="space-y-4">
            {rooms.map(room => (
              <ChatRoomCard
                key={room.id}
                room={room}
                onEdit={(id) => router.push(`/chat_rooms/edit-chat-room?id=${id}`)}
                onDelete={async (id) => {
                  if (confirm('Are you sure you want to delete this chat room?')) {
                    try {
                      await axios.delete(`${apiUrl}/api/chat_rooms/${id}`);
                      setRooms(prev => prev.filter(r => r.id !== id));
                      alert('Chat room deleted');
                    } catch {
                      alert('Error deleting chat room');
                    }
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatRoomsPage;
