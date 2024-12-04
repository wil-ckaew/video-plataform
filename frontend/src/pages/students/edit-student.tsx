import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Header';

interface Student {
  id: string;
  name: string;
  age: number;
  created_at: string;
}

const EditStudentPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();
  const { id } = router.query;

  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<{ name: string; age: number }>({
    name: '',
    age: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchStudent = async () => {
        try {
          const response = await axios.get(`${apiUrl}/api/students/${id}`);
          setStudent(response.data.student);
          setFormData({
            name: response.data.student.name,
            age: response.data.student.age
          });
          setError(null);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setError(`Error fetching student data: ${errorMessage}`);
        } finally {
          setLoading(false);
        }
      };

      fetchStudent();
    }
  }, [id, apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'age' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && student) {
      try {
        await axios.patch(`${apiUrl}/api/students/${id}`, formData);
        alert('Student updated successfully');
        router.push('/students/students'); // Redireciona após a atualização
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Error updating student: ${errorMessage}`);
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <h1 className="text-xl font-semibold mb-4">Edit Student</h1>
          {student && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-gray-700">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Update Student
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
};

export default EditStudentPage;
