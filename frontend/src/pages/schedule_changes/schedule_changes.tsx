import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface ScheduleChange {
  id: string;
  group_id: string;
  change_date: string;
  description: string;
  created_at?: string;
}

const ScheduleChangeCard: React.FC<{
  scheduleChange: ScheduleChange;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ scheduleChange, onEdit, onDelete }) => (
  <div className="bg-white p-4 rounded shadow">
    <p><strong>Date:</strong> {scheduleChange.change_date}</p>
    <p><strong>Description:</strong> {scheduleChange.description}</p>
    <p><strong>Group ID:</strong> {scheduleChange.group_id}</p>
    <p><small className="text-gray-500">Created: {scheduleChange.created_at || 'N/A'}</small></p>
    <div className="mt-2 space-x-2">
      <button
        onClick={() => onEdit(scheduleChange.id)}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(scheduleChange.id)}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  </div>
);

const ScheduleChangesPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();
  const [scheduleChanges, setScheduleChanges] = useState<ScheduleChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${apiUrl}/api/schedule_changes`)
      .then(res => setScheduleChanges(res.data.schedule_changes))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden bg-gray-100 p-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Schedule Changes</h1>
          <button
            onClick={() => router.push('/schedule_changes/add-schedule_change')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Schedule Change
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : scheduleChanges.length === 0 ? (
          <p className="text-center text-gray-600">No schedule changes found.</p>
        ) : (
          <div className="space-y-4">
            {scheduleChanges.map(sc => (
              <ScheduleChangeCard
                key={sc.id}
                scheduleChange={sc}
                onEdit={(id) => router.push(`/schedule_changes/edit-schedule_change?id=${id}`)}
                onDelete={async (id) => {
                  if (confirm('Delete this schedule change?')) {
                    await axios.delete(`${apiUrl}/api/schedule_changes/${id}`);
                    setScheduleChanges(prev => prev.filter(s => s.id !== id));
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

export default ScheduleChangesPage;
