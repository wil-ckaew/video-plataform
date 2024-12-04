import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Header from '../../components/Header';
import Link from 'next/link';

// Importa ReactPlayer dinamicamente com SSR desativado
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const VideosPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/videos`);
        setVideos(response.data.videos || []);
        setSelectedVideo(response.data.videos[0] || null); // Define o primeiro vídeo como o selecionado por padrão
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

  const handleVideoSelect = (video: any, index: number) => {
    setSelectedVideo(video);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      const nextIndex = currentIndex + 1;
      setSelectedVideo(videos[nextIndex]);
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setSelectedVideo(videos[prevIndex]);
      setCurrentIndex(prevIndex);
    }
  };

  // Função para verificar se o arquivo é MP4 ou URL
  const isMP4 = (url: string) => {
    return url && (url.endsWith('.mp4') || url.startsWith('http://') || url.startsWith('https://'));
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-4">Videos</h1>
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="flex flex-row space-x-4">
            {/* Painel do Player (esquerda) */}
            <div className="flex-1">
              {selectedVideo && (
                <div className="video-container">
                  <ReactPlayer
                    url={isMP4(selectedVideo.filename) ? `/videos/${selectedVideo.filename}` : selectedVideo.filename} // Verifica se é MP4 ou URL
                    controls
                    width="100%"
                    height="auto"
                    style={{ maxWidth: '100%' }}
                  />
                  <div className="flex justify-between mt-4">
                    {/* Setas de Navegação */}
                    <button
                      className="bg-gray-500 text-white p-3 rounded-full"
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                    >
                      Previous
                    </button>

                    {/* Botões Adicionar e Editar no meio */}
                    <div className="flex space-x-4">
                      <Link
                        href="/videos/add-video"
                        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                      >
                        Add Video
                      </Link>
                      {selectedVideo && (
                        <Link
                          href={`/videos/edit-video?id=${selectedVideo.id}`}
                          className="bg-green-500 text-white px-4 py-1 rounded-full hover:bg-green-600"
                        >
                          Imagem GIF
                        </Link>
                      )}
                    </div>

                    {/* Botão Próximo */}
                    <button
                      className="bg-gray-500 text-white p-3 rounded-full"
                      onClick={handleNext}
                      disabled={currentIndex === videos.length - 1}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Painel de Vídeos em Miniatura (direita) */}
            <div className="w-1/3 bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-screen">
              <h2 className="text-xl font-semibold mb-4">Other Videos</h2>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {videos.map((video: any, index: number) => (
                  <div key={video.id} className="flex flex-col items-center space-y-2">
                    <div
                      className="w-full h-24 overflow-hidden bg-gray-300 cursor-pointer"
                      onClick={() => handleVideoSelect(video, index)}
                    >
                      <div className="video-container">
                        <ReactPlayer
                          url={isMP4(video.filename) ? `/videos/${video.filename}` : video.filename} // Verifica se é MP4 ou URL
                          controls
                          width="100%"
                          height="100%"
                          style={{ maxWidth: '100%' }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-sm">{video.description}</p>
                      <Link
                        href={`/videos/edit-video?id=${video.id}`} // Link para edição do vídeo
                        className="bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 mt-2 block text-xs"
                      >
                        Imagem GIF
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VideosPage;
