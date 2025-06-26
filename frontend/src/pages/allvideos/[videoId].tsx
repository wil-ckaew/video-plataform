import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import Header from '../../components/Header';

const UploadVideoPage: React.FC = () => {
  const router = useRouter();
  const { videoId } = router.query; // Pega o ID do vídeo da URL

  const [file, setFile] = useState<File | null>(null); // Arquivo do vídeo
  const [loading, setLoading] = useState(false); // Estado de carregamento

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Por favor, selecione um vídeo para fazer upload.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('video_id', videoId as string); // Envia o ID do vídeo junto

    try {
      // Envia o arquivo de vídeo com os metadados para a API
      const response = await axios.post('http://localhost:8080/api/all_videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload do vídeo concluído:', response.data);
      alert('Vídeo enviado com sucesso!');

      router.push('/allvideos/allvideos');
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(`Erro ao fazer upload do vídeo: ${error.response?.data.message || error.message}`);
      } else {
        alert('Erro desconhecido ao fazer upload do vídeo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Fazer Upload do Vídeo</h1>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-gray-700">Selecione o arquivo do vídeo</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white p-3 rounded-md"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Fazer Upload"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default UploadVideoPage;
