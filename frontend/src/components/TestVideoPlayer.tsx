import dynamic from 'next/dynamic';
import React from 'react';

// Importa ReactPlayer dinamicamente com SSR desativado
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const TestVideoPlayer: React.FC = () => {
  return (
    <div className="video-container">
      <ReactPlayer 
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" // URL de teste
        controls 
        width="100%" 
        height="auto" 
        style={{ maxWidth: '100%' }}
      />
      <p>Test Video Description</p>
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

export default TestVideoPlayer;
