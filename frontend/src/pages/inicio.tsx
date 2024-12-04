// pages/inicio.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';
import VideoPhotoCard from '../components/VideoPhotoCard';
import Header from '../components/Header';
import Link from 'next/link';

interface Video {
  id: string;
  filename: string;
  description: string;
}

interface Photo {
  id: string;
  filename: string;
  description: string;
}

const InicioPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const [videos, setVideos] = useState<Video[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const videoResponse = await axios.get(`${apiUrl}/api/videos`);
        const photoResponse = await axios.get(`${apiUrl}/api/photos`);
        setVideos(videoResponse.data.videos || []);
        setPhotos(photoResponse.data.photos || []);
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`Error fetching data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <>
            {/* Botões no Topo */}
            <div className="mb-4 flex justify-end space-x-4">
              <Link href="/videos/add-video" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Add Video
              </Link>
              {/* Botão Edit para o primeiro vídeo da lista */}
              {videos.length > 0 && (
                <Link href={`/videos/edit-video/${videos[0].id}`} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Edit Video
                </Link>
              )}
            </div>

            {/* Exibindo o Primeiro Vídeo com Player */}
            {videos.length > 0 && (
              <div className="mb-4">
                <VideoPlayer
                  url={`${apiUrl}/uploads/${videos[0].filename}`} // Usando o primeiro vídeo como principal
                  description={videos[0].description}
                />
              </div>
            )}

            {/* Exibindo os Outros Vídeos em Miniatura lado a lado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.length > 1 ? (
                videos.slice(1).map((video: Video) => (
                  <div key={video.id} className="flex flex-col items-center">
                    <VideoPlayer
                      url={`${apiUrl}/uploads/${video.filename}`}
                      description={video.description}
                    />
                    <p className="mt-2 text-center">{video.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">No more videos available</p>
              )}
            </div>

            {/* Seção de Fotos */}
            <div className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold mb-4">Photos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.length > 0 ? (
                  photos.map((photo) => (
                    <VideoPhotoCard
                      key={photo.id}
                      document={{ id: photo.id, filename: photo.filename, content: photo.description }}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-600">No photos available</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default InicioPage;
