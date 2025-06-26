// frontend/src/pages/messages/messages.tsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface ChatRoom {
  id: string;
  name: string;
  last_message?: string;
  last_message_date?: string;
}

const MessagesPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/chat_rooms`);
        setChatRooms(res.data.chat_rooms);
        setError(null);
      } catch {
        setError('Failed to load chat rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchChatRooms();
  }, [apiUrl]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <main className="flex flex-1 flex-col max-w-md mx-auto w-full p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          <button
            onClick={() => router.push('/messages/new-message')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            aria-label="New message"
          >
            New
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading chat rooms...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : chatRooms.length === 0 ? (
          <p className="text-center text-gray-500">No conversations yet.</p>
        ) : (
          <ul>
            {chatRooms.map(room => (
              <li
                key={room.id}
                onClick={() => router.push(`/messages/chat?id=${room.id}`)}
                className="cursor-pointer bg-white rounded-lg p-4 mb-3 shadow hover:bg-gray-100 transition"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">{room.name}</p>
                  {room.last_message_date && (
                    <time
                      dateTime={room.last_message_date}
                      className="text-xs text-gray-400"
                    >
                      {new Date(room.last_message_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </time>
                  )}
                </div>
                <p className="text-gray-600 truncate">{room.last_message || 'No messages yet'}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default MessagesPage;
