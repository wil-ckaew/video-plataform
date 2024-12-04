// src/components/VideoCardComponent.tsx
import React from 'react';

interface Video {
  id: string;
  filename: string;
  description: string;
}

interface VideoCardComponentProps {
  video: Video;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void; // Adiciona a propriedade onClick
}

const VideoCardComponent: React.FC<VideoCardComponentProps> = ({ video, onEdit, onDelete, onClick }) => {
  return (
    <div
      className="bg-white p-4 border border-gray-300 rounded shadow-md cursor-pointer"
      onClick={onClick} // Adiciona a função de clique para selecionar o vídeo
    >
      <h3 className="text-lg font-semibold mb-2">{video.filename}</h3>
      <p className="text-gray-700 mb-4">{video.description}</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(video.id);
          }}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(video.id);
          }}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default VideoCardComponent;
