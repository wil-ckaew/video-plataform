import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Header from '../../components/Header';
import Link from 'next/link';

// Importa ReactPlayer dinamicamente com SSR desativado
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const VideosPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const [meusvideos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/meusvideos`);
        setVideos(response.data.meusvideos || []);
        if (response.data.meusvideos.length > 0) {
          setSelectedVideo(response.data.meusvideos[0]); // Define o primeiro vídeo como selecionado inicialmente
        }
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`Error fetching videos: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [apiUrl]);

  // Função para trocar o vídeo
  const handleNextVideo = () => {
    if (!selectedVideo) return;
    const currentIndex = meusvideos.findIndex((video) => video.id === selectedVideo.id);
    const nextIndex = (currentIndex + 1) % meusvideos.length; // Encontra o próximo vídeo, com loop
    setSelectedVideo(meusvideos[nextIndex]);
  };

  const handlePrevVideo = () => {
    if (!selectedVideo) return;
    const currentIndex = meusvideos.findIndex((video) => video.id === selectedVideo.id);
    const prevIndex = (currentIndex - 1 + meusvideos.length) % meusvideos.length; // Encontra o vídeo anterior, com loop
    setSelectedVideo(meusvideos[prevIndex]);
  };

  // Função para verificar se a URL é um link completo ou caminho de arquivo
  const getVideoUrl = (filename: string) => {
    // Verifica se a URL começa com http ou https (link externo)
    if (filename.startsWith('http') || filename.startsWith('https')) {
      return filename; // Retorna URL externa se for um link completo
    } else {
      // Caso contrário, tenta acessar o arquivo local
      return `/meus_videos/${filename}`; // Ajuste o caminho conforme necessário
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4 flex justify-center">
        <div className="max-w-6xl w-full flex gap-8">
          {/* Player de mídia grande com setas de navegação */}
          <div className="flex-1 flex flex-col items-center">
            {selectedVideo ? (
              <div className="relative">
                {/* Setas de navegação */}
                <button
                  onClick={handlePrevVideo}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
                >
                  &#8592; {/* Setinha esquerda */}
                </button>

                <div className="w-full max-w-4xl">
                  <ReactPlayer
                    url={getVideoUrl(selectedVideo.filename)} // Usa a função para determinar o caminho correto
                    playing={true} // Força o player a tocar o vídeo
                    controls
                    width="100%"
                    height="500px" // Aumenta a altura do player
                    style={{ maxWidth: '100%' }}
                  />
                  {selectedVideo.description && <p>{selectedVideo.description}</p>}
                </div>

                <button
                  onClick={handleNextVideo}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
                >
                  &#8594; {/* Setinha direita */}
                </button>
              </div>
            ) : (
              <p className="text-center text-gray-600">No video selected</p>
            )}
          </div>

          {/* Painel rolante de miniaturas à direita */}
          <div className="w-1/3 max-h-[500px] overflow-y-auto p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">All Videos</h2>
            {loading ? (
              <p className="text-center text-gray-600">Loading...</p>
            ) : error ? (
              <p className="text-center text-red-600">{error}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {meusvideos.length > 0 ? (
                  meusvideos.map((meusvideo: any) => (
                    <div key={meusvideo.id} className="flex flex-col items-center space-y-2">
                      <div
                        className="w-full h-32 overflow-hidden bg-gray-300 cursor-pointer"
                        onClick={() => setSelectedVideo(meusvideo)} // Atualiza o vídeo selecionado
                      >
                        <ReactPlayer
                          url={getVideoUrl(meusvideo.filename)} // Usa a função para determinar o caminho correto
                          controls
                          width="100%"
                          height="100%"
                          style={{ maxWidth: '100%' }}
                        />
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-sm">{meusvideo.description}</p>
                        <Link
                          href={`/meus_videos/edit-video?id=${meusvideo.id}`}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2 block"
                        >
                          Edit Video
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-600 col-span-full">No more videos available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideosPage;
