import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig';
import { AxiosError } from 'axios';
import Header from '../../components/Header';

const AddDocumentPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    student_id: '',
    doc_type: '',
    file: null as File | null,
  });
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]); // Alterado para 'name'
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/students');
        setStudents(response.data.students || []);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData(prevState => ({ ...prevState, file: files[0] }));
    } else {
      setFormData(prevState => ({ ...prevState, file: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = new FormData();
    updatedData.append('student_id', formData.student_id);
    updatedData.append('doc_type', formData.doc_type);
    if (formData.file) {
      updatedData.append('file', formData.file);
    }

    try {
      await api.post('/api/documents', updatedData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Document added successfully');
      router.push('/documents/documents');
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Error adding document: ${error.response?.data?.message || error.message}`);
      } else {
        alert('Error adding document: Unknown error');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Add Document</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="student_id" className="block text-gray-700">Student</label>
            <select
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} {/* Alterado para 'name' */}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="doc_type" className="block text-gray-700">Document Type</label>
            <input
              type="text"
              id="doc_type"
              name="doc_type"
              value={formData.doc_type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="file" className="block text-gray-700">Upload Document</label>
            <input
              type="file"
              id="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Document
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddDocumentPage;
