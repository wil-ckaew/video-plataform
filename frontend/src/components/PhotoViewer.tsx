import React from 'react';

interface PhotoViewerProps {
  src: string;
  description?: string;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({ src, description }) => {
  return (
    <div className="photo-container">
      <img src={src} alt={description} />
      {description && <p>{description}</p>}
      <style jsx>{`
        .photo-container {
          margin-bottom: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        img {
          width: 100%;
          height: auto;
          border-radius: 8px;
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

export default PhotoViewer;
