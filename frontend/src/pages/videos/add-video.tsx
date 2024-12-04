import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig';
import { AxiosError } from 'axios';
import Header from '../../components/Header';

interface Student {
  id: string;
  name: string;
}

const AddVideoPage: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<{ description: string; student_id: string }>({
    description: '',
    student_id: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log('Fetching students...');
        const response = await api.get('/api/students');
        console.log('Students fetched successfully:', response.data);
        setStudents(response.data.students || []);
      } catch (error) {
        console.error('Failed to load students:', error);
        setError('Failed to load students.');
      }
    };

    fetchStudents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      console.log('File selected:', e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
    console.log('Form data updated:', formData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');

    if (!file) {
      setError('Por favor, faça upload de um arquivo de vídeo.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('student_id', formData.student_id);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('file', file);

    console.log('Form data being sent:', formDataToSend);

    try {
      // Primeiro, envia os metadados do vídeo (como descrição e ID do aluno)
      const metadataResponse = await api.post('/api/meusvideos', {
        student_id: formData.student_id,
        description: formData.description,
        filename: file.name, // Envia o nome do arquivo como parte dos metadados
      });

      if (metadataResponse.status === 200) {
        console.log('Metadados gravados com sucesso!');
      } else {
        console.error('Erro ao gravar metadados');
        setError('Erro ao gravar metadados.');
        return;
      }

      // Agora, se houver um arquivo de vídeo, enviaremos o arquivo
      const fileFormData = new FormData();
      fileFormData.append('video', file);
      fileFormData.append('student_id', formData.student_id); // Envia o ID do aluno junto

      // Envia o arquivo de vídeo para o servidor
      const fileResponse = await api.post('/api/upload', fileFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Resposta do servidor de upload:', fileResponse.data); // Log completo da resposta

      // Verifique se a resposta do servidor contém a URL do arquivo
      let fileUrl = fileResponse.data.file_url; // Tenta pegar a URL do arquivo

      if (!fileUrl) {
        // Se o campo file_url não estiver presente, usa o nome do arquivo como fallback
        console.warn('file_url não encontrado na resposta. Usando o nome do arquivo como URL.');
        fileUrl = file.name; // Aqui você pode usar o nome do arquivo como URL temporária
      }

      // Atualiza os metadados com a URL do arquivo
      await api.post('/api/meusvideos', {
        student_id: formData.student_id,
        filename: fileUrl, // Usa a URL do arquivo no lugar do nome
        description: formData.description,
        file_url: fileUrl,
      });

      console.log('Upload do vídeo concluído:', fileUrl);
      setSuccessMessage('Vídeo enviado com sucesso!');
      router.push('/meus_videos/videos');
    } catch (error) {
      if (error instanceof AxiosError) {
        // Exibe detalhes mais detalhados sobre o erro para facilitar a depuração
        console.error('Erro na requisição:', error.response?.data);
        setError(`Erro ao adicionar vídeo: ${error.response?.data?.message || error.message}`);
      } else {
        console.error('Erro desconhecido:', error);
        setError('Erro ao adicionar vídeo: Erro desconhecido');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Adicionar Vídeo</h1>
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="student_id" className="block text-gray-700">Estudante</label>
            <select
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
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
            <label htmlFor="file" className="block text-gray-700">Arquivo de Vídeo</label>
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
            Adicionar Vídeo
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddVideoPage;
