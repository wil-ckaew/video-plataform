// src/pages/photos/add-photo.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig';
import { AxiosError } from 'axios';
import Header from '../../components/Header';

const AddPhotoPage: React.FC = () => {
  const router = useRouter();
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState<{ student_id: string; description: string }>({ student_id: '', description: '' });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/students');
        setStudents(response.data.students || []);
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(`Error fetching students: ${error.message}`);
        } else {
          setError('Unknown error occurred');
        }
      }
    };

    fetchStudents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prevState => ({ ...prevState, student_id: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    const photoData = {
      student_id: formData.student_id,
      description: formData.description,
      filename: file.name,
    };

    try {
      const response = await api.post('/api/photos', photoData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      alert('Photo added successfully');
      router.push('/photos/photos');
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Error adding photo: ${error.message}`);
      } else {
        alert('Error adding photo: Unknown error');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Add Photo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="student_id" className="block text-gray-700">Student</label>
            <select
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleStudentChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="file" className="block text-gray-700">File</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-gray-700">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Photo
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddPhotoPage;
