import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Header';

const AddVideoPage: React.FC = () => {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null); // Arquivo do vídeo
  const [description, setDescription] = useState(''); // Descrição do vídeo
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [videoId, setVideoId] = useState(''); // ID do vídeo (associado ao banco de dados ou outro)
  const [status, setStatus] = useState(''); // Status do vídeo
  const [videos, setVideos] = useState<{ id: string; title: string }[]>([]); // Lista de vídeos

  // Buscar vídeos (para preencher o select)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se o vídeo foi selecionado
    if (!file) {
      alert("Por favor, selecione um vídeo.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("description", description);

    try {
      // Envia o vídeo para o servidor
      const response = await axios.post("http://localhost:8080/api/all_videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Vídeo enviado com sucesso!");
      console.log(response.data);

      // Agora redireciona para a tela onde pode-se adicionar mais informações (status, etc.)
      setVideoId(response.data.videoId); // Recebe o ID do vídeo do backend
      router.push('/addVideoDetails'); // Redireciona para uma página de adicionar detalhes

    } catch (error) {
      console.error("Erro ao enviar o vídeo:", error);
      alert("Falha ao enviar o vídeo.");
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
            <label htmlFor="video" className="block text-gray-700">Vídeo</label>
            <button
              type="button"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="w-full p-2 border border-gray-300 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Selecionar Vídeo
            </button>
            <input
              type="file"
              id="file-upload"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700">Descrição</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Descrição do vídeo"
              required
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
