import React from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string; // URL do vídeo
  description?: string; // Descrição opcional
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, description }) => {
  return (
    <div className="video-container">
      <ReactPlayer 
        url={url} 
        controls 
        width="100%" 
        height="auto" 
        style={{ maxWidth: '100%' }}
      />
      {description && <p>{description}</p>}
      <style jsx>{`
        .video-container {
          margin-bottom: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        p {
          text-align: center;
          font-size: 16px;
          color: #555;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
