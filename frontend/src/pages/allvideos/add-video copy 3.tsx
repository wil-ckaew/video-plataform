import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import Header from '../../components/Header';

const AddVideoPage: React.FC = () => {
  const router = useRouter();

  // Definindo estados para cada campo
  const [file, setFile] = useState<File | null>(null); // Arquivo do vídeo
  const [videoPath, setVideoPath] = useState(''); // Caminho do vídeo
  const [videoId, setVideoId] = useState(''); // ID do vídeo
  const [status, setStatus] = useState(''); // Status do vídeo
  const [videos, setVideos] = useState<{ id: string; title: string }[]>([]); // Lista de vídeos
  const [loading, setLoading] = useState(false); // Estado de carregamento

  // Buscar vídeos para preencher o select
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/videos');
        setVideos(response.data.videos || []);
      } catch (error) {
        console.error('Erro ao buscar vídeos:', error);
      }
    };
    fetchVideos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setVideoPath(selectedFile.name); // Preenche o nome do arquivo automaticamente
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Por favor, selecione um vídeo.");
      return;
    }

    setLoading(true);

    try {
      // 1. Envia o arquivo para o servidor usando 'multipart/form-data'
      const formData = new FormData();
      formData.append("video", file); // O arquivo
      formData.append("video_path", videoPath); // O caminho do arquivo
      formData.append("status", status); // O status do vídeo

      const uploadResponse = await axios.post('http://localhost:8080/api/all_videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Resposta da API (upload):', uploadResponse.data);

      // Verifique se o upload foi bem-sucedido
      if (uploadResponse.data.status === 'success') {
        // 2. Envia os metadados do vídeo para o servidor usando 'application/json'
        const metadata = {
          video_id: videoId,  // O ID do vídeo
          video_path: videoPath,  // O caminho do vídeo
          status: status,      // O status do vídeo
        };

        console.log('Enviando metadados:', JSON.stringify(metadata));

        // Envia os metadados como JSON
        const metadataResponse = await axios.post('http://localhost:8080/api/all_videos', metadata, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Resposta da API (metadados):', metadataResponse.data);

        alert("Vídeo e metadados enviados com sucesso!");
        router.push('/allvideos/allvideos');
      } else {
        alert('Erro ao fazer upload do arquivo');
      }
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="videoId" className="block text-gray-700">Vídeo</label>
            <select
              id="videoId"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Selecione um Vídeo</option>
              {videos.map((video) => (
                <option key={video.id} value={video.id}>
                  {video.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="file" className="block text-gray-700">Arquivo</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="videoPath" className="block text-gray-700">Caminho do Vídeo</label>
            <input
              type="text"
              id="videoPath"
              value={videoPath}
              onChange={(e) => setVideoPath(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              readOnly
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-gray-700">Status</label>
            <input
              type="text"
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
