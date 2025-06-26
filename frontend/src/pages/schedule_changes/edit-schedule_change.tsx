import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface Group {
  id: string;
  name: string;
}

const EditScheduleChangePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const [groups, setGroups] = useState<Group[]>([]);
  const [formData, setFormData] = useState({
    group_id: '',
    change_date: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${apiUrl}/api/groups`)
      .then(res => setGroups(res.data.groups))
      .catch(() => setGroups([]));
  }, [apiUrl]);

  useEffect(() => {
    if (!id) return;
    axios.get(`${apiUrl}/api/schedule_changes/${id}`)
      .then(res => {
        setFormData({
          group_id: res.data.schedule_change.group_id,
          change_date: res.data.schedule_change.change_date,
          description: res.data.schedule_change.description,
        });
        setError(null);
      })
      .catch(() => setError('Failed to load schedule change'))
      .finally(() => setLoading(false));
  }, [id, apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.group_id || !formData.change_date || !formData.description) {
      setError('All fields are required');
      return;
    }

    try {
      await axios.patch(`${apiUrl}/api/schedule_changes/${id}`, formData);
      router.push('/schedule_changes/schedule_changes');
    } catch {
      setError('Failed to update schedule change');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 bg-gray-100 p-4 max-w-md mx-auto w-full">
        <h1 className="text-xl font-semibold mb-4">Edit Schedule Change</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="group_id"
            value={formData.group_id}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Group</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <input
            type="date"
            name="change_date"
            value={formData.change_date}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
            className="w-full p-2 border rounded"
            rows={4}
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

export default EditScheduleChangePage;
    