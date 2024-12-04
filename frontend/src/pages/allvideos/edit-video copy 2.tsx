import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Header';

interface Video {
  id: string;
  title: string;
}

const EditVideoPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [video, setVideo] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ status: string; video_id: string }>({ status: '', video_id: '' });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await axios.get(`http://localhost:8080/api/all_videos/${id}`);
          setVideo(response.data.all_video);
          setFormData({
            status: response.data.all_video.status,
            video_id: response.data.all_video.video_id,
          });
        } catch (error) {
          setError('Error fetching video');
        }
      }

      try {
        const videosResponse = await axios.get('http://localhost:8080/api/videos');
        setVideos(videosResponse.data.videos || []);
      } catch (error) {
        setError('Error fetching videos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Função específica para tratar a mudança no campo select (para o video_id)
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('status', formData.status);
    formDataToSend.append('video_id', formData.video_id);
    if (file) {
      formDataToSend.append('video', file);  // Enviando o arquivo de vídeo, se houver
    }

    try {
      const response = await axios.patch(`http://localhost:8080/api/all_videos/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'application/json'
        },
      });

      console.log('Vídeo atualizado com sucesso:', response.data);
      alert('Vídeo atualizado com sucesso');
      router.push('/allvideos/allvideos');
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
      alert('Erro ao atualizar vídeo');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <h1 className="text-xl font-semibold mb-4">Edit Video</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="video_id" className="block text-gray-700">Video</label>
            <select
              id="video_id"
              name="video_id"
              value={formData.video_id}
              onChange={handleSelectChange}  // Aqui é o handleSelectChange
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select a Video</option>
              {videos.map(video => (
                <option key={video.id} value={video.id}>
                  {video.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="file" className="block text-gray-700">File</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-gray-700">Status</label>
            <input
              type="text"
              id="status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Video
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditVideoPage;
