import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import Header from '../../components/Header';

const AddVideoPage: React.FC = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    student_id: '',
    filename: '', 
    description: '',
    videoUrl: '', 
    file: null as File | null,
  });

  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('/api/students');
        setStudents(response.data.students || []);
      } catch (error) {
        console.error('Erro ao buscar estudantes:', error);
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
      setFormData(prevState => ({ 
        ...prevState, 
        file: files[0],
        filename: files[0].name // Define o nome do arquivo no campo filename
      }));
    } else {
      setFormData(prevState => ({ 
        ...prevState, 
        file: null, 
        filename: '' // Se não houver arquivo, limpa o campo filename
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file && !formData.videoUrl) {
      alert("Por favor, selecione um vídeo ou insira o link do vídeo.");
      return;
    }

    setLoading(true);
    try {
      // Primeiro, enviamos os metadados do vídeo (como descrição, ID de aluno, etc.)
      const metadataResponse = await axios.post('/api/meusvideos', {
        student_id: formData.student_id,
        filename: formData.filename || formData.videoUrl,  // Usa o filename ou a URL do vídeo
        description: formData.description,
      });

      if (metadataResponse.status === 200) {
        alert('Metadados gravados com sucesso!');
      } else {
        alert('Erro ao gravar metadados');
        return;
      }

      // Agora, se houver um arquivo de vídeo, enviaremos o arquivo para o servidor
      if (formData.file) {
        const fileFormData = new FormData();
        fileFormData.append('video', formData.file);
        fileFormData.append('student_id', formData.student_id); // Envia o ID do aluno junto

        // Envia o vídeo para o servidor
        const fileResponse = await axios.post("http://localhost:8080/api/upload", fileFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log('Resposta do servidor de upload:', fileResponse.data);  // Log completo da resposta

        // Verifique se a resposta do servidor contém a URL do arquivo
        let fileUrl = fileResponse.data.file_url; // Tenta pegar a URL do arquivo

        if (!fileUrl) {
          // Se o campo file_url não estiver presente, usa o nome do arquivo como fallback
          console.warn("file_url não encontrado na resposta. Usando o nome do arquivo como URL.");
          fileUrl = formData.filename;  // Aqui você pode usar o nome do arquivo como URL temporária
        }

        // Atualiza os metadados com a URL do arquivo
        await axios.post('/api/meusvideos', {
          student_id: formData.student_id,
          filename: fileUrl,  // Usa o URL do arquivo no lugar do nome
          description: formData.description,
          file_url: fileUrl,
        });

        console.log("Upload do vídeo concluído:", fileUrl);
      }

      alert('Vídeo enviado com sucesso!');
      router.push('/meus_videos/videos');
    } catch (error) {
      if (error instanceof AxiosError) {
        // Exibe detalhes mais detalhados sobre o erro para facilitar a depuração
        console.error('Erro na requisição:', error.response?.data);
        alert(`Erro ao adicionar vídeo: ${error.response?.data?.message || error.message}`);
        if (error.response?.data) {
          console.log('Erro Detalhado:', error.response.data);
        }
      } else {
        console.error('Erro desconhecido:', error);
        alert('Erro ao adicionar vídeo: Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Adicionar Vídeo</h1>

        {/* Formulário para selecionar vídeo */}
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
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fileName" className="block text-gray-700">Caminho do Vídeo</label>
            <input
              type="text"
              id="fileName"
              value={formData.filename}  // Exibe o nome do arquivo selecionado
              onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              readOnly  // O campo é somente leitura
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

          {/* Alterna entre arquivo de vídeo e URL */}
          <div>
            <label htmlFor="file" className="block text-gray-700">Upload de Vídeo</label>
            <input
              type="file"
              id="file"
              accept="video/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="videoUrl" className="block text-gray-700">Ou insira o link do vídeo</label>
            <input
              type="url"
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="https://example.com/video.mp4"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Adicionar Vídeo'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddVideoPage;
