// src/pages/videos/upload-video.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig';
import { AxiosError } from 'axios';
import Header from '../../components/Header';
import Alert from '../../components/Alert';

const UploadVideoPage: React.FC = () => {
  const router = useRouter();
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState<{ description: string; student_id: string }>({
    description: '',
    student_id: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/students');
        setStudents(response.data.students || []);
      } catch (error) {
        setError(`Error fetching students: ${error instanceof AxiosError ? error.message : 'Unknown error'}`);
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
    const updatedData = new FormData();
    updatedData.append('student_id', formData.student_id);
    updatedData.append('description', formData.description);
    if (file) {
      updatedData.append('file', file);
    }

    try {
      await api.post('/api/meusvideos', updatedData);
      setSuccessMessage('Video uploaded successfully');
      router.push('/meus_videos/videos');
    } catch (error) {
      setError(`Error uploading video: ${error instanceof AxiosError ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Upload Video</h1>
        {successMessage && <Alert message={successMessage} />}
        {error && <Alert message={error} />}
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
              accept="video/*"
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
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Upload Video
          </button>
        </form>
      </main>
    </div>
  );
};

export default UploadVideoPage;
