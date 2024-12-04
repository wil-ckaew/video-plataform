// src/components/UploadFile.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface UploadFileProps {
  setUploads: React.Dispatch<React.SetStateAction<any[]>>;
}

const UploadFile: React.FC<UploadFileProps> = ({ setUploads }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'video' | 'photo'>('photo');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('file_type', fileType);
    
    try {
      const response = await axios.post(`${apiUrl}/api/file_metadatas`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Atualiza os uploads após o sucesso
      setUploads((prev) => [...prev, response.data.file_metadata]);
      // Reset fields
      setFile(null);
      setDescription('');
      setFileType('photo');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold">Upload File</h3>
      {error && <p className="text-red-600">{error}</p>}
      <input 
        type="file" 
        accept="image/*,video/*" 
        onChange={handleFileChange} 
        className="mt-2"
      />
      <input 
        type="text" 
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-2 p-2 border border-gray-300 rounded"
      />
      <select 
        value={fileType} 
        onChange={(e) => setFileType(e.target.value as 'video' | 'photo')}
        className="mt-2 p-2 border border-gray-300 rounded"
      >
        <option value="photo">Photo</option>
        <option value="video">Video</option>
      </select>
      <button 
        onClick={handleUpload} 
        disabled={uploading} 
        className={`mt-4 p-2 bg-blue-500 text-white rounded ${uploading ? 'opacity-50' : ''}`}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default UploadFile;
