// frontend/src/pages/warnings/edit-warning.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface Student {
  id: string;
  name: string;
}

interface Warning {
  id: string;
  student_id: string;
  reason: string;
}

const EditWarningPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();
  const { id } = router.query;

  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    student_id: '',
    reason: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/students`);
        setStudents(res.data.students);
      } catch {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [apiUrl]);

  useEffect(() => {
    if (!id) return;
    const fetchWarning = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/warnings/${id}`);
        const w = res.data.warning;
        setFormData({
          student_id: w.student_id,
          reason: w.reason,
        });
        setError(null);
      } catch {
        setError('Failed to fetch warning data');
      } finally {
        setLoading(false);
      }
    };
    fetchWarning();
  }, [id, apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id) {
      setError('Student is required');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Reason is required');
      return;
    }
    try {
      await axios.patch(`${apiUrl}/api/warnings/${id}`, {
        student_id: formData.student_id,
        reason: formData.reason.trim(),
      });
      alert('Warning updated');
      router.push('/warnings/warnings');
    } catch {
      setError('Error updating warning');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto bg-gray-100 p-4 max-w-md mx-auto w-full">
          <h1 className="text-xl font-semibold mb-4">Edit Warning</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="student_id" className="block mb-1 font-medium text-gray-700">
                Student
              </label>
              <select
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select a student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block mb-1 font-medium text-gray-700">
                Reason
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={4}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Warning
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default EditWarningPage;

