import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig';
import { AxiosError } from 'axios';
import Header from '../../components/Header';

const AddFile_MetadataPage: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [formData, setFormData] = useState<{ user_id: string; description: string; file_type: 'video' | 'photo' }>({
    user_id: '',
    description: '',
    file_type: 'photo', // Default type
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users');
        setUsers(response.data.users || []);
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(`Error fetching users: ${error.message}`);
        } else {
          setError('Unknown error occurred');
        }
      }
    };

    fetchUsers();
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

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prevState => ({ ...prevState, user_id: e.target.value }));
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prevState => ({ ...prevState, file_type: e.target.value as 'video' | 'photo' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    // Criar FormData para enviar o arquivo e os dados do formulário
    const formDataToSend = new FormData();
    formDataToSend.append('user_id', formData.user_id);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('file_type', formData.file_type);
    formDataToSend.append('file', file); // Envia o arquivo selecionado

    try {
      const response = await api.post('http://localhost:8080/api/file_metadatas/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data', // Tipo de conteúdo para upload de arquivos
        },
      });

      if (response.data.status === 'success') {
        // Após o upload, cria o metadado no banco
        const fileMetadata = {
          user_id: formData.user_id,
          file_type: formData.file_type,
          filename: response.data.file_url.split('/').pop(), // Nome do arquivo
          description: formData.description,
        };

        // Corrigindo a URL do endpoint para adicionar os metadados no banco
        await api.post('http://localhost:8080/api/file_metadatas', fileMetadata);

        alert('File_Metadata added successfully');
        router.push('/uploads/uploads');
      } else {
        alert('Error uploading file');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Error adding file_metadata: ${error.message}`);
      } else {
        alert('Error adding file_metadata: Unknown error');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Add File_Metadata</h1>
        {error && <p className="text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user_id" className="block text-gray-700">User</label>
            <select
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleUserChange}
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
          <div>
            <label htmlFor="file_type" className="block text-gray-700">File Type</label>
            <select
              id="file_type"
              name="file_type"
              value={formData.file_type}
              onChange={handleFileTypeChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add File_Metadata
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddFile_MetadataPage;
