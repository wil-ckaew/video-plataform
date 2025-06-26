import React from 'react';

interface Photo {
  id: string;
  filename: string;
  description: string;
}

interface PhotoCardComponentProps {
  photo: Photo;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PhotoCardComponent: React.FC<PhotoCardComponentProps> = ({ photo, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <img
        src={`http://localhost:8080/static/images/${photo.filename}`} // Ajuste para o caminho correto
        alt={photo.description}
        className="w-full h-auto rounded"
      />
      <div className="mt-2">
        <p>{photo.description}</p>
        <button onClick={() => onEdit(photo.id)} className="text-blue-500 hover:underline">Edit</button>
        <button onClick={() => onDelete(photo.id)} className="text-red-500 hover:underline ml-2">Delete</button>
      </div>
    </div>
  );
};

export default PhotoCardComponent;
