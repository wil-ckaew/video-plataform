import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

const EditMessagePage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({ content: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    axios.get(`${apiUrl}/api/messages/${id}`)
      .then(res => setFormData({ content: res.data.message.content }))
      .catch(() => setError('Failed to load message'))
      .finally(() => setLoading(false));
  }, [id, apiUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(`${apiUrl}/api/messages/${id}`, formData);
      router.push('/messages/messages');
    } catch {
      setError('Failed to update message');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ content: e.target.value });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 bg-gray-100 p-4 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold mb-4">Edit Message</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          {error && <p className="text-red-600">{error}</p>}
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Update
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditMessagePage;
