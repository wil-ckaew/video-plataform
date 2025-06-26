import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig';
import { AxiosError } from 'axios';
import Header from '../../components/Header';

interface Student {
  id: string;
  name: string;
}

const EditVideoPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [video, setVideo] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    description: string;
    student_id: string;
    filename: string;
    video_url: string;
  }>({
    description: '',
    student_id: '',
    filename: '',
    video_url: ''
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      const fetchVideo = async () => {
        try {
          const response = await api.get(`/api/meusvideos/${id}`);
          setVideo(response.data.meusvideo);
          setFormData({
            description: response.data.meusvideo.description,
            filename: response.data.meusvideo.filename,
            student_id: response.data.meusvideo.student_id || '',
            video_url: response.data.meusvideo.file_url || ''
          });
          setError(null);
        } catch (error) {
          if (error instanceof AxiosError) {
            setError(`Error fetching video data: ${error.message}`);
          } else {
            setError('Unknown error occurred');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchVideo();
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
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFormData((prevState) => ({
        ...prevState,
        filename: selectedFile.name, // Atualizando o nome do arquivo
        video_url: '' // Limpa o link de vídeo se um arquivo for enviado
      }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
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

    const formDataToSend = new FormData();
    formDataToSend.append('description', formData.description);
    formDataToSend.append('student_id', formData.student_id);
    formDataToSend.append('filename', formData.filename);

    // Se o arquivo foi alterado, envia o arquivo
    if (file) {
      formDataToSend.append('file', file);
    } else {
      formDataToSend.append('file_url', formData.video_url || video?.file_url || '');
    }

    try {
      await api.patch(`/api/meusvideos/${id}`, formDataToSend, {
        headers: {
          // O navegador definirá o Content-Type automaticamente
        }
      });
      alert('Video updated successfully');
      router.push('/meus_videos/videos');
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Error updating video: ${error.message}`);
      } else {
        alert('Error updating video: Unknown error');
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Edit Video</h1>
        {video && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="student_id" className="block text-gray-700">Estudante</label>
              <select
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleStudentChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Selecione um estudante</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="video_url" className="block text-gray-700">Caminho do Vídeo</label>
              <input
                type="text"
                id="video_url"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Ou insira o link do vídeo"
              />
            </div>
            <div>
              <label htmlFor="file" className="block text-gray-700">Upload de Vídeo</label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
              {!file && !formData.video_url && (
                <p className="text-gray-500 mt-2">Nenhum arquivo escolhido</p>
              )}
              {file && (
                <p className="text-gray-500 mt-2">{file.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="description" className="block text-gray-700">Descrição</label>
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
              Atualizar Vídeo
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default EditVideoPage;
