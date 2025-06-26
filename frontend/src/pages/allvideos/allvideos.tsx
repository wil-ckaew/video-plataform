import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import dynamic from 'next/dynamic';

// Importa ReactPlayer dinamicamente com SSR desativado
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface Video {
  id: string;
  student_id: string;
  filename: string; // Tanto para URL quanto para o nome do arquivo de vídeo MP4
  description?: string;
  file_url: string;
}

const VideosPage: React.FC = () => {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const [meusVideos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para controle de paginação
  const [page, setPage] = useState(1); // Página inicial
  const [limit] = useState(10); // Limite de vídeos por página

  // Função para buscar vídeos da API com paginação
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/meusvideos`, {
        params: { limit, page },
      });
      setVideos(response.data.meusvideos || []);
      if (response.data.meusvideos && response.data.meusvideos.length > 0) {
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

  useEffect(() => {
    fetchVideos();
  }, [apiUrl, page, limit]);

  const handleNextVideo = () => {
    if (!selectedVideo) return;
    const currentIndex = meusVideos.findIndex((video) => video.id === selectedVideo.id);
    const nextIndex = (currentIndex + 1) % meusVideos.length; // Encontra o próximo vídeo, com loop
    setSelectedVideo(meusVideos[nextIndex]);
  };

  const handlePrevVideo = () => {
    if (!selectedVideo) return;
    const currentIndex = meusVideos.findIndex((video) => video.id === selectedVideo.id);
    const prevIndex = (currentIndex - 1 + meusVideos.length) % meusVideos.length; // Encontra o vídeo anterior, com loop
    setSelectedVideo(meusVideos[prevIndex]);
  };

  // Função para verificar se a URL é do YouTube
  const isYouTubeUrl = (url: string) => {
    const youtubePattern = /(?:https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|(?:www\.)?youtu\.be\/))([a-zA-Z0-9_-]{11})/;
    return youtubePattern.test(url);
  };

  // Função para gerar a URL do embed do YouTube
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0]; // Pega o ID do vídeo
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  // Função para verificar se é um vídeo MP4
  const isMP4File = (filename: string) => {
    return filename && filename.toLowerCase().endsWith('.mp4');
  };

  // Função para obter a URL do vídeo
  const getVideoUrl = (filename: string) => {
    if (isYouTubeUrl(filename)) {
      return getYouTubeEmbedUrl(filename); // Se for URL do YouTube, usa o embed
    }
    if (isMP4File(filename)) {
      return `${apiUrl}/uploads/${filename}`; // Retorna o caminho local para arquivo MP4
    }
    return filename; // Caso contrário, retorna o URL diretamente
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video); // Atualiza o vídeo selecionado ao clicar na miniatura
  };

  // Navegar para a página de Adicionar
  const handleAddClick = () => {
    router.push('/meus_videos/add-video'); // Caminho correto para a página de Adicionar
  };

  // Navegar para a página de Editar
  const handleEditClick = (video: Video) => {
    router.push(`/meus_videos/edit-video?id=${video.id}`); // Corrigido para passar o 'id' como parâmetro da query string
  };

  // Função para ir para a próxima página
  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Função para ir para a página anterior
  const handlePrevPage = () => {
    if (page > 1) setPage((prevPage) => prevPage - 1);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-row h-full bg-gray-100 p-4">
        {/* Painel esquerdo (player de vídeo) */}
        <div className="flex-3 bg-white border border-gray-200 rounded-lg shadow-md p-4">
          {selectedVideo ? (
            <>
              <div className="flex justify-center h-[70%]"> {/* Ajustando altura do player */}
                {isYouTubeUrl(selectedVideo.filename) ? (
                  <iframe
                    width="100%"
                    height="100%" // Ajusta a altura para 100% do painel
                    src={getVideoUrl(selectedVideo.filename)}
                    title="YouTube Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="w-full h-full object-cover" // Altura ajustada para ocupar todo o painel
                    controls
                    autoPlay // Isso faz com que o vídeo comece a tocar automaticamente
                    src={getVideoUrl(selectedVideo.filename)}
                  />
                )}
              </div>
              <div className="flex justify-between items-center mt-4">
                {/* Botões de Navegação dentro do painel do player */}
                <button
                  onClick={handlePrevVideo}
                  className="bg-gray-500 text-white p-3 rounded-full"
                  disabled={!selectedVideo || meusVideos.findIndex((video) => video.id === selectedVideo.id) === 0}
                >
                  &#8592;
                </button>

                {/* Botão Próximo */}
                <button
                  onClick={handleNextVideo}
                  className="bg-gray-500 text-white p-3 rounded-full"
                  disabled={!selectedVideo || meusVideos.findIndex((video) => video.id === selectedVideo.id) === meusVideos.length - 1}
                >
                  &#8594;
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600">Selecione um vídeo para assistir.</p>
          )}
        </div>

        {/* Painel direito (lista de vídeos com miniaturas e botões de ação) */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-md p-4 ml-4">
          <div className="flex items-center justify-between mb-4">
            {/* Container para Label, Botões Adicionar/Editar e Botões de Navegação */}
            <div className="flex items-center justify-between w-full">
              <label className="text-gray-800 font-semibold text-xl flex-grow">Vídeos</label>
              
              {/* Botões Adicionar/Editar entre os botões de navegação */}
              <div className="flex justify-between items-center w-1/2 space-x-4">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="bg-gray-500 text-white p-3 rounded-full"
                >
                  &#8592;
                </button>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddClick}
                    className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
                  >
                    Adicionar Vídeo
                  </button>
                  {selectedVideo && (
                    <button
                      onClick={() => handleEditClick(selectedVideo)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                    >
                      Editar Vídeo
                    </button>
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  className="bg-gray-500 text-white p-3 rounded-full"
                >
                  &#8594;
                </button>
              </div>
            </div>
          </div>

          {/* Lista de vídeos */}
          <div className="grid grid-cols-3 gap-4">
            {meusVideos.map((video) => (
              <div
                key={video.id}
                className={`cursor-pointer flex flex-col items-center space-y-2 ${
                  selectedVideo?.id === video.id ? 'border-4 border-blue-500' : ''
                }`} // Adiciona borda para destacar o vídeo selecionado
                onClick={() => handleVideoClick(video)}
              >
                <div className="w-full h-24 overflow-hidden bg-gray-300 rounded-lg">
                  <ReactPlayer
                    url={getVideoUrl(video.filename)}
                    controls
                    playing={selectedVideo?.id === video.id}  // Inicia a reprodução automaticamente
                    width="100%"
                    height="100%"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs">{video.description}</p>
                  {selectedVideo?.id === video.id && (
                    <span className="text-sm text-white bg-blue-500 px-2 py-1 rounded-full">Em Destaque</span> // Label de destaque
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideosPage;
