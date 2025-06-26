import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Header'; // Certifique-se de ter esse componente ou crie um simples

interface FileMetadata {
  id: string;
  filename: string;
  file_type: 'video' | 'photo';
  description?: string;
  uploaded_at: string;
  file_url: string;
}

const FileMetadatasPage: React.FC = () => {
  const router = useRouter();
  const [fileMetadatas, setFileMetadatas] = useState<FileMetadata[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<FileMetadata | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Função para buscar os vídeos na API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/file_metadatas');
        setFileMetadatas(response.data.file_metadatas); // Certifique-se de que esse é o caminho correto na resposta
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  // Função para lidar com o clique no vídeo
  const handleVideoClick = (video: FileMetadata) => {
    if (videoRef.current) {
      videoRef.current.pause(); // Pausa o vídeo atual ao selecionar outro
      videoRef.current.currentTime = 0; // Reseta o vídeo para o começo
    }
    setSelectedVideo(video);
  };

  // Navegar para a página de Adicionar
  const handleAddClick = () => {
    router.push('/uploads/add-upload'); // Caminho correto para a página de Adicionar
  };

  // Navegar para a página de Editar
  const handleEditClick = (video: FileMetadata) => {
    router.push(`/uploads/edit-upload?id=${video.id}`); // Corrigido para passar o 'id' como parâmetro da query string
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-row h-full bg-gray-100 p-4">
        {/* Painel esquerdo (lista de vídeos) */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-md p-4 mr-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-gray-800 font-semibold text-xl">Fotos e Vídeos</label>
            <button
              onClick={handleAddClick}
              className="text-white bg-green-500 hover:bg-green-600 py-2 px-4 rounded-md"
            >
              Adicionar Vídeo
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-4">
              {fileMetadatas.length > 0 ? (
                fileMetadatas.map((file) => (
                  <li key={file.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      {file.file_type === 'video' && (
                        <button
                          onClick={() => handleVideoClick(file)}
                          className="w-full text-left p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          {file.filename}
                        </button>
                      )}
                      <div className="text-sm text-gray-500">
                        <p>ID: {file.id}</p>
                        <p>Descrição: {file.description || 'Sem descrição'}</p>
                        <p>Data de Upload: {new Date(file.uploaded_at).toLocaleDateString()}</p>
                        <p>URL: <a href={file.file_url} target="_blank" className="text-blue-500">{file.file_url}</a></p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(file)}
                        className="px-3 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-600">No videos available</p>
              )}
            </ul>
          </div>
        </div>

        {/* Painel direito (player de vídeo) */}
        <div className="w-2/3 flex flex-col items-center p-4 max-h-screen overflow-hidden">
          {selectedVideo ? (
            <>
              {/* Título do vídeo com fonte menor */}
              <h2 className="text-lg font-semibold mb-4 text-center">{selectedVideo.filename}</h2>

              <div className="flex flex-col items-center w-full">
                <video
                  ref={videoRef}
                  key={selectedVideo.id}
                  controls
                  autoPlay
                  className="video-player-content w-full max-h-[70vh] object-contain mb-4"
                >
                  <source
                    src={`http://localhost:8080/uploads/${selectedVideo.filename}`}
                    type="video/mp4"
                  />
                  Seu navegador não suporta a tag de vídeo.
                </video>
              </div>

              {/* Ocultar os dados abaixo do player */}
              <div className="text-sm text-gray-500 mt-4 hidden">
                <p>ID: {selectedVideo.id}</p>
                <p>Descrição: {selectedVideo.description || 'Sem descrição'}</p>
                <p>Data de Upload: {new Date(selectedVideo.uploaded_at).toLocaleDateString()}</p>
                <p>URL: <a href={selectedVideo.file_url} target="_blank" className="text-blue-500">{selectedVideo.file_url}</a></p>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">Selecione um vídeo para visualizar</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default FileMetadatasPage;
