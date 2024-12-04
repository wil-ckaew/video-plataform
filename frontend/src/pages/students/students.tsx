import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentCardComponent from '../../components/StudentCardComponent';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface Student {
  id: string;
  name: string;
  age: number;
  created_at: string;
}

const StudentsPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/students`);
        console.log('Fetched students:', response.data.students); // Adicione este log
        setStudents(response.data.students || []);
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`Error fetching students: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  const handleAddStudent = () => {
    router.push('/students/add-student');
  };

  const handleEdit = (id: string) => {
    router.push(`/students/edit-student?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${apiUrl}/api/students/${id}`);
        setStudents(students.filter(student => student.id !== id));
        alert('Student deleted successfully');
      } catch (error) {
        alert('Error deleting student');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-800 font-semibold">Students</p>
            <button
              onClick={handleAddStudent}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Student
            </button>
          </div>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <StudentCardComponent
                  key={student.id}
                  student={student}
                  onEdit={handleEdit}
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

export default StudentsPage;
