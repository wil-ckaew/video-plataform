import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Header'; // Certifique-se de ter esse componente ou crie um simples

// Defina o tipo para o 'video'
interface VideoMetadata {
  id: number;
  filename: string;
}

const VideoListPage: React.FC = () => {
  const router = useRouter();
  const [videoList, setVideoList] = useState<VideoMetadata[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null); // Referência para o elemento de vídeo

  // Função para buscar os vídeos na API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/file_metadatas');
        console.log('Videos:', response.data);  // Verifique os dados da API no console
        setVideoList(response.data.file_metadatas); // Certifique-se de que esse é o caminho correto na resposta
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  // Função para lidar com o clique no vídeo
  const handleVideoClick = (video: VideoMetadata) => {
    if (videoRef.current) {
      videoRef.current.pause(); // Pausa o vídeo atual ao selecionar outro
      videoRef.current.currentTime = 0; // Reseta o vídeo para o começo
    }
    console.log('Selected video:', video);  // Verifique os dados do vídeo selecionado
    setSelectedVideo(video); // Atualiza o estado com o vídeo selecionado
  };

  return (
    <div className="page-container">
      {/* Menu - pode ser um componente separado */}
      <Header />

      <div className="content-container flex">
        {/* Lista de vídeos com rolagem à esquerda */}
        <div className="video-list w-2/5 max-h-[80vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-md p-4">
          <h1>Video List</h1>
          <ul>
            {videoList.map((video) => (
              <li key={video.id} className="video-item mb-4">
                <button 
                  onClick={() => handleVideoClick(video)} 
                  className="video-button w-full text-left p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {video.filename}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Exibição do vídeo selecionado à direita */}
        <div className="video-player w-3/5 bg-white border border-gray-200 rounded-lg shadow-md p-4">
          {selectedVideo ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Selected Video: {selectedVideo.filename}</h2>
              <div className="flex flex-col items-center">
                <video 
                  ref={videoRef} // Adiciona a referência ao elemento de vídeo
                  key={selectedVideo.id} // Força o player a se re-renderizar quando o vídeo mudar
                  controls 
                  autoPlay // Adiciona a funcionalidade de autoplay
                  className="video-player-content mb-2"
                >
                  <source
                    src={`http://localhost:8080/uploads/${selectedVideo.filename}`}
                    type="video/mp4"
                  />
                  Seu navegador não suporta a tag de vídeo.
                </video>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">Selecione um vídeo para visualizar</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .video-list {
          max-height: 80vh; /* Limita a altura da lista de vídeos */
          overflow-y: auto; /* Permite rolar quando a lista for maior que o espaço disponível */
        }
        
        .video-player-content {
          width: 100%;
          max-width: 100%; /* Para garantir que o vídeo não ultrapasse a largura disponível */
          max-height: 80vh; /* Ajusta a altura do vídeo para 80% da altura da tela */
          object-fit: contain; /* Isso mantém a proporção do vídeo sem distorcê-lo */
        }
      `}</style>
    </div>
  );
};

export default VideoListPage;
