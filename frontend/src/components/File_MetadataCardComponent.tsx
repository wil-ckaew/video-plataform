import React from 'react';

interface FileMetadata {
  id: string;
  user_id: string; // Esta propriedade precisa ser incluída
  file_type: 'video' | 'photo'; // Esta propriedade precisa ser incluída
  filename: string;
  description?: string;
  uploaded_at: string; // Esta propriedade precisa ser incluída
}

interface FileCardProps {
  file: FileMetadata; // Use a estrutura correta aqui
  onEdit: (id: string) => void; // Para o botão de edição
  onDelete: (id: string) => void; // Para o botão de exclusão
}

const File_MetadataCardComponent: React.FC<FileCardProps> = ({ file, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{file.filename}</h3>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(file.id)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
            Edit
          </button>
          <button onClick={() => onDelete(file.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
      <div className="mb-2">
        {file.file_type === 'photo' ? (
          <img src={`/${file.filename}`} alt={file.description || file.filename} className="w-full h-auto rounded" />
        ) : (
          <video src={`/${file.filename}`} controls className="w-full h-auto rounded" />
        )}
      </div>
      <p className="text-gray-700 mb-2">{file.description}</p>
      <p className="text-gray-500 text-sm">Uploaded At: {new Date(file.uploaded_at).toLocaleDateString()}</p>
    </div>
  );
};

export default File_MetadataCardComponent;
