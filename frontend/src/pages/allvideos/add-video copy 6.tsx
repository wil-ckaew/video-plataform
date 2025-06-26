import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import Header from '../../components/Header';

const AddVideoPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    video_id: '',
    video_path: '',
    status: '',
    file: null as File | null,
  });
  const [videos, setVideos] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar vídeos para preencher o select
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('/api/videos');
        setVideos(response.data.videos || []);
      } catch (error) {
        console.error('Erro ao buscar vídeos:', error);
      }
    };
    fetchVideos();
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
        video_path: files[0].name  // Define o nome do arquivo no campo video_path
      }));
    } else {
      setFormData(prevState => ({ 
        ...prevState, 
        file: null, 
        video_path: '' // Se não houver arquivo, limpa o campo video_path
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) {
      alert("Por favor, selecione um vídeo.");
      return;
    }

    setLoading(true);

    try {
      // Primeiramente, enviamos os metadados via POST para a API
      const metadataResponse = await axios.post('http://localhost:8080/api/all_videos', {
        video_id: formData.video_id,
        video_path: formData.video_path,
        status: formData.status
      });

      if (metadataResponse.status === 200) {
        alert('Metadados gravados com sucesso!');
      } else {
        alert('Erro ao gravar metadados');
        return;
      }

      // Agora, enviamos o arquivo de vídeo para o servidor
      const fileFormData = new FormData();
      fileFormData.append('video', formData.file);
      fileFormData.append('video_id', formData.video_id); // Envia o ID do vídeo

      const fileResponse = await axios.post("http://localhost:8080/api/all_videos/upload", fileFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const fileUrl = fileResponse.data.file_url; // Recebe a URL do arquivo do servidor
      console.log("Upload do vídeo concluído:", fileResponse.data);

      // Agora, atualize os metadados no servidor com a URL do arquivo
      await axios.post('http://localhost:8080/api/all_videos', {
        video_id: formData.video_id,
        video_path: formData.video_path,
        status: formData.status,
        file_url: fileUrl,  // Inclui o file_url aqui
      });

      alert('Vídeo enviado com sucesso!');

      // Redireciona para a página de vídeos
      router.push('/allvideos/allvideos');
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Erro na requisição:', error.response?.data);
        alert(`Erro ao adicionar vídeo: ${error.response?.data.message || error.message}`);
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
            <label htmlFor="video_id" className="block text-gray-700">Título</label>
            <select
              id="video_id"
              name="video_id"
              value={formData.video_id}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Selecione um vídeo</option>
              {videos.map((video) => (
                <option key={video.id} value={video.id}>
                  {video.title} {/* Exibe o título do vídeo */}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="file" className="block text-gray-700">Upload do Vídeo</label>
            <input
              type="file"
              id="file"
              accept="video/mp4"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="videoPath" className="block text-gray-700">Caminho do Vídeo</label>
            <input
              type="text"
              id="videoPath"
              value={formData.video_path}  // Exibe o nome do arquivo selecionado
              onChange={(e) => setFormData({ ...formData, video_path: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              readOnly  // O campo é somente leitura
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-gray-700">Status</label>
            <input
              type="text"
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white p-3 rounded-md"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Enviar Vídeo"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddVideoPage;
