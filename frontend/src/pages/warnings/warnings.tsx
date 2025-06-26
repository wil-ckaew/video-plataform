// frontend/src/pages/warnings/warnings.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface Warning {
  id: string;
  student_id: string;
  student_name?: string; // se o backend mandar
  reason: string;
  warning_date: string;
}

const WarningCard: React.FC<{
  warning: Warning;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ warning, onEdit, onDelete }) => (
  <div className="bg-white p-4 rounded shadow">
    <h3 className="text-lg font-semibold">{warning.student_name || warning.student_id}</h3>
    <p className="text-gray-700">Reason: {warning.reason}</p>
    <p className="text-gray-600 text-sm">Date: {new Date(warning.warning_date).toLocaleDateString()}</p>
    <div className="mt-2 space-x-2">
      <button
        onClick={() => onEdit(warning.id)}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={() => {
          if(confirm('Are you sure you want to delete this warning?')) onDelete(warning.id);
        }}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  </div>
);

const WarningsPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarnings = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/warnings`);
        setWarnings(res.data.warnings);
        setError(null);
      } catch {
        setError('Failed to load warnings.');
      } finally {
        setLoading(false);
      }
    };
    fetchWarnings();
  }, [apiUrl]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${apiUrl}/api/warnings/${id}`);
      setWarnings((prev) => prev.filter(w => w.id !== id));
      alert('Warning deleted');
    } catch {
      alert('Error deleting warning');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto bg-gray-100 p-4 max-w-3xl mx-auto w-full">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">Warnings</h1>
            <button
              onClick={() => router.push('/warnings/add-warning')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Warning
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : warnings.length === 0 ? (
            <p className="text-center text-gray-600">No warnings found.</p>
          ) : (
            <div className="space-y-4">
              {warnings.map(w => (
                <WarningCard
                  key={w.id}
                  warning={w}
                  onEdit={(id) => router.push(`/warnings/edit-warning?id=${id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default WarningsPage;
