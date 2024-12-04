import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig';
import { AxiosError } from 'axios';
import Header from '../../components/Header';

interface Student {
  id: string;
  name: string;
}

const EditPhotoPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [photo, setPhoto] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ description: string; student_id: string }>({ description: '', student_id: '' });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPhoto = async () => {
        try {
          const response = await api.get(`/api/photos/${id}`);
          setPhoto(response.data.photo);
          setFormData({
            description: response.data.photo.description,
            student_id: response.data.photo.student_id || ''
          });
          setError(null);
        } catch (error) {
          if (error instanceof AxiosError) {
            setError(`Error fetching photo data: ${error.message}`);
          } else {
            setError('Unknown error occurred');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchPhoto();
    }

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
  }, [id]);

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

    const formDataToSend = {
      description: formData.description,
      student_id: formData.student_id,
      filename: file ? file.name : photo?.filename, // Use o nome do arquivo se o arquivo não for alterado
    };

    try {
      await api.patch(`/api/photos/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      alert('Photo updated successfully');
      router.push('/photos/photos');
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Error updating photo: ${error.message}`);
      } else {
        alert('Error updating photo: Unknown error');
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Edit Photo</h1>
        {photo && (
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Photo
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default EditPhotoPage;
