import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header'; // Certifique-se de ter esse componente ou crie um simples

// Defina o tipo para o 'video'
interface VideoMetadata {
  id: number;
  filename: string;
}

const VideoListPage: React.FC = () => {
  const [videoList, setVideoList] = useState<VideoMetadata[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);

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

  const handleVideoClick = (video: VideoMetadata) => {
    console.log('Selected video:', video);  // Verifique os dados do vídeo selecionado
    setSelectedVideo(video);
  };

  return (
    <div className="page-container">
      {/* Menu - pode ser um componente separado */}
      <Header /> 
      
      <div className="content-container">
        {/* Lista de vídeos com rolagem à esquerda */}
        <div className="video-list">
          <h1>Video List</h1>
          <ul>
            {videoList.map((video) => (
              <li key={video.id} className="video-item">
                <button onClick={() => handleVideoClick(video)} className="video-button">
                  {video.filename}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Exibição do vídeo selecionado à direita */}
        <div className="video-player">
          {selectedVideo && (
            <>
              <h2>Selected Video: {selectedVideo.filename}</h2>
              <video controls width="600">
                <source
                  src={`http://localhost:8080/uploads/${selectedVideo.filename}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoListPage;
