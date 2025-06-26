import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/axiosConfig';
import PhotoCardComponent from '../../components/PhotoCardComponent';
import Header from '../../components/Header';
import { AxiosError } from 'axios';

interface Photo {
  id: string;
  filename: string;
  description: string;
}

const PhotosPage: React.FC = () => {
  const router = useRouter();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await api.get('/api/photos');
        setPhotos(response.data.photos || []);
        setError(null);
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(`Error fetching photos: ${error.message}`);
        } else {
          setError('Unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/photos/edit-photo?id=${id}`);
  };

  const handleAddPhoto = () => {
    router.push('/photos/add-photo');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      try {
        await api.delete(`/api/photos/${id}`);
        setPhotos(photos.filter(photo => photo.id !== id));
        alert('Photo deleted successfully');
      } catch (error) {
        if (error instanceof AxiosError) {
          alert(`Error deleting photo: ${error.message}`);
        } else {
          alert('Error deleting photo: Unknown error');
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-800 font-semibold">Fotos</p>
          <button
            onClick={handleAddPhoto}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Photo
          </button>
        </div>
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="space-y-4">
            {photos.length > 0 ? (
              photos.map((photo) => (
                <PhotoCardComponent
                  key={photo.id}
                  photo={photo}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
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
