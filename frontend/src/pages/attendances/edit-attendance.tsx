import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface Student {
  id: string;
  name: string;
}

const EditAttendancePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    student_id: '',
    attendance_date: '',
    status: 'present',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          axios.get(`${apiUrl}/api/students`),
          axios.get(`${apiUrl}/api/attendances/${id}`)
        ]);
        setStudents(studentsRes.data.students);

        const attendance = attendanceRes.data.attendance;
        setFormData({
          student_id: attendance.student_id,
          attendance_date: attendance.attendance_date.slice(0, 10), // formato YYYY-MM-DD
          status: attendance.status,
          notes: attendance.notes || '',
        });
        setError(null);
      } catch {
        setError('Failed to load attendance or students');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, apiUrl]);

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
      await axios.patch(`${apiUrl}/api/attendances/${id}`, formData);
      alert('Attendance updated');
      router.push('/attendances/attendances');
    } catch {
      setError('Failed to update attendance');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <main className="flex flex-1 flex-col max-w-md mx-auto w-full p-4">
        <h1 className="text-2xl font-bold mb-6">Edit Attendance</h1>
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
              name="attendance_date"
              value={formData.attendance_date}
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
              <option value="present">Present</option>
              <option value="absent">Absent</option>
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
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Update Attendance
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditAttendancePage;
