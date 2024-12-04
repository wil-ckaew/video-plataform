// src/components/VideoPhotoCard.tsx
import React from 'react';
import { useRouter } from 'next/router';

interface Document {
  id: string;
  filename: string;
  content: string;
}

interface VideoPhotoCardProps {
  document: Document;
  onClick?: () => void;
}

const VideoPhotoCard: React.FC<VideoPhotoCardProps> = ({ document, onClick }) => {
  const router = useRouter();
  const imageUrl = `http://localhost:8080/uploads/${document.filename}`;

  const handleEdit = () => {
    router.push(`/edit/${document.id}`);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`/api/documents/${document.id}`, {
          method: 'DELETE',
        });
        alert('Item deleted successfully');
        router.reload();
      } catch (error) {
        alert('Error deleting item');
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-2 hover:bg-gray-50" onClick={onClick}>
      <div className="text-md font-semibold text-gray-800">Filename: {document.filename}</div>
      <div className="text-md text-gray-700">
        <img
          src={imageUrl}
          alt={document.filename}
          className="w-full h-auto"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.png'; // Use a placeholder image if error
          }}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleEdit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default VideoPhotoCard;
