import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig';
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
  const [videos, setVideos] = useState<{ id: string; title: string }[]>([]); // Lista de vídeos
  const [loading, setLoading] = useState(false); // Estado de carregamento

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
      // Atualiza o estado com o arquivo e o nome do arquivo
      setFormData(prevState => ({
        ...prevState,
        file: files[0],
        video_path: files[0].name, // Adicionando o nome do arquivo ao campo "video_path"
      }));
    } else {
      // Limpa o estado caso não haja arquivo
      setFormData(prevState => ({ ...prevState, file: null, video_path: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      alert('Por favor, selecione um vídeo.');
      return;
    }

    setLoading(true);

    try {
      // Envio de metadados
      const metadataResponse = await api.post('/api/all_videos', formData, {
        headers: {
          //'Content-Type': 'multipart/form-data',
          "Content-Type": "application/json",
        },
      });
      alert('Metadados gravados com sucesso!');

      // Envio do arquivo de vídeo
      const formFileData = new FormData();
      formFileData.append('video', formData.file);
      formFileData.append('video_id', formData.video_id); // Envia o ID do vídeo junto

      const fileResponse = await axios.post("http://localhost:8080/api/all_videos/upload", formFileData, {
        headers: {
          "Content-Type": "multipart/form-data", // Enviando o arquivo como multipart
        },
      });

      console.log("Upload do vídeo concluído:", fileResponse.data);
      alert('Vídeo enviado com sucesso!');

      // Redireciona para a página de vídeos e recarrega os dados
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
            <label htmlFor="video_id" className="block text-gray-700">Title</label>
            <select
              id="video_id"
              name="video_id"
              value={formData.video_id}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select a video</option>
              {videos.map((video) => (
                <option key={video.id} value={video.id}>
                  {video.title}  {/* Corrigido 'tile' para 'title' */}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="file" className="block text-gray-700">Upload Document</label>
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
              value={formData.video_path} // Exibe o nome do arquivo selecionado
              onChange={(e) => setFormData({ ...formData, video_path: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              readOnly // Torna o campo somente leitura para exibir o nome do arquivo
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
            disabled={loading}  // Desabilita o botão enquanto o vídeo está sendo carregado
          >
            {loading ? "Carregando..." : "Enviar Vídeo"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddVideoPage;
