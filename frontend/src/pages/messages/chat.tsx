// frontend/src/pages/messages/chat.tsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface Message {
  id: string;
  sender_name: string;
  content: string;
  sent_at: string;
  is_me: boolean;
}

const ChatPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/messages/${id}`);
        const msgs: Message[] = res.data.messages.map((m: any) => ({
          ...m,
          is_me: m.sender_id === res.data.current_user_id,
        }));
        setMessages(msgs);
        setError(null);
      } catch {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [id, apiUrl]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !id) return;

    try {
      await axios.post(`${apiUrl}/api/messages/${id}`, { content: input });
      setMessages(prev => [
        ...prev,
        {
          id: 'temp-' + Date.now(),
          sender_name: 'Me',
          content: input,
          sent_at: new Date().toISOString(),
          is_me: true,
        },
      ]);
      setInput('');
    } catch {
      alert('Failed to send message');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading chat...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <main className="flex flex-col flex-1 max-w-md mx-auto w-full p-4">
        <div className="flex-1 overflow-auto mb-4 space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`max-w-[75%] p-3 rounded-lg break-words ${
                msg.is_me
                  ? 'bg-blue-600 text-white self-end'
                  : 'bg-gray-200 text-gray-900 self-start'
              }`}
              style={{ alignSelf: msg.is_me ? 'flex-end' : 'flex-start' }}
            >
              <p className="font-semibold text-sm mb-1">{msg.sender_name}</p>
              <p>{msg.content}</p>
              <time
                dateTime={msg.sent_at}
                className="block text-xs text-gray-400 mt-1 text-right"
              >
                {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') handleSend(); }}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-5 rounded hover:bg-blue-700 transition"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
