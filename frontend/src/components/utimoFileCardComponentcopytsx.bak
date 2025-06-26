// src/components/FileCardComponent.tsx
import React from 'react';

interface FileMetadata {
  id: string;
  user_id: string;  // Adicione esta propriedade se necessário
  file_type: 'video' | 'photo';
  filename: string;
  description?: string;
  uploaded_at: string;
}

interface FileCardProps {
  file: FileMetadata;
}

const FileCardComponent: React.FC<FileCardProps> = ({ file }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{file.filename}</h3>
        <div className="flex space-x-2">
          <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
            Edit
          </button>
          <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
      <div className="mb-2">
        {file.file_type === 'photo' ? (
          <img
            src={`/${file.filename}`}
            alt={file.description || file.filename}
            className="w-full h-auto rounded"
          />
        ) : (
          <video
            src={`/${file.filename}`}
            controls
            className="w-full h-auto rounded"
          />
        )}
      </div>
      <p className="text-gray-700 mb-2">{file.description}</p>
      <p className="text-gray-500 text-sm">Uploaded At: {new Date(file.uploaded_at).toLocaleDateString()}</p>
    </div>
  );
};

export default FileCardComponent;
