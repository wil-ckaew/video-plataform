import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig';
import { AxiosError } from 'axios';
import Header from '../../components/Header';

interface User {
  id: string;
  username: string; // Atualize se necessário
}

const EditFile_MetadataPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [file_metadata, setFile_Metadata] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ description: string; user_id: string }>({ description: '', user_id: '' });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await api.get(`/api/file_metadatas/${id}`);
          setFile_Metadata(response.data.file_metadata);
          setFormData({
            description: response.data.file_metadata.description,
            user_id: response.data.file_metadata.user_id || ''
          });
        } catch (error) {
          if (error instanceof AxiosError) {
            setError(`Error fetching file_metadata data: ${error.message}`);
          } else {
            setError('Unknown error occurred');
          }
        }
      }

      try {
        const response = await api.get('/api/users');
        setUsers(response.data.users || []);
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(`Error fetching users: ${error.message}`);
        } else {
          setError('Unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    setFormData(prevState => ({ ...prevState, user_id: e.target.value }));
  };

  const convertFileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1]; // Retira o prefixo "data:image/png;base64,"
        resolve(base64 || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let base64File = '';
    if (file) {
      base64File = await convertFileToBase64(file);
    }

    const formDataToSend = {
      description: formData.description,
      user_id: formData.user_id,
      filename: file ? file.name : file_metadata?.filename,
      file: base64File // Arquivo codificado em Base64
    };

    try {
      await api.patch(`/api/file_metadatas/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'application/json' // Envia como JSON
        }
      });
      alert('File_Metadata updated successfully');
      router.push('/uploads/uploads');
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Error updating file_metadata: ${error.message}`);
      } else {
        alert('Error updating file_metadata: Unknown error');
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Edit File_Metadata</h1>
        {file_metadata && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="user_id" className="block text-gray-700">User</label>
              <select
                id="user_id"
                name="user_id"
                value={formData.user_id}
                onChange={handleStudentChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
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
              Update File_Metadata
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default EditFile_MetadataPage;
