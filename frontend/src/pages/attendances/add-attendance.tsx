// frontend/src/pages/attendances/add-attendance.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface Student {
  id: string;
  name: string;
}

const AddAttendancePage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    student_id: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'presente', // <-- corrigido aqui
    notes: '',
  });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_id) {
      setError('Select a student');
      return;
    }

    try {
      await axios.post(`${apiUrl}/api/attendances`, formData); // <- Envia exatamente os nomes corretos
      alert('Attendance added');
      router.push('/attendances/attendances');
    } catch (err: any) {
      console.error('Erro ao adicionar presença:', err.response?.data || err.message);
      const message = err.response?.data?.message || 'Failed to add attendance';
      setError(message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <main className="flex flex-1 flex-col max-w-md mx-auto w-full p-4">
        <h1 className="text-2xl font-bold mb-6">Add Attendance</h1>
        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded shadow">

          <label className="block">
            <span className="text-gray-700 font-semibold mb-1 block">Student</span>
            <select
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
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold mb-1 block">Date</span>
            <input
              type="date"
              name="date" // <- Corrigido aqui também
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold mb-1 block">Status</span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="presente">Presente</option>
              <option value="falta">Falta</option>
            </select>

          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold mb-1 block">Notes (optional)</span>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
            />
          </label>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition"
          >
            Save Attendance
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddAttendancePage;
