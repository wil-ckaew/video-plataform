import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPhotoCard from '../components/VideoPhotoCard';
import Header from '../components/Header';
import { useRouter } from 'next/router';

interface Photo {
  id: string;
  filename: string;
  description: string;
}

const PhotosPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/photos`);
        setPhotos(response.data.photos || []);
        setError(null); // Clear any previous errors
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`Error fetching photos: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  const handleAdd = () => {
    router.push('/add-photo'); // Redirect to the add photo page
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <button
          onClick={handleAdd}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600"
        >
          Add Photo
        </button>
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
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
        )}
      </main>
    </div>
  );
};

export default PhotosPage;
