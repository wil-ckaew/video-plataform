import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router"; // Para redirecionamento
import Header from "../../components/Header";

const AddVideoPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null); // Dados do vídeo
  const [status, setStatus] = useState(""); // Estado para editar o status
  const [videoId, setVideoId] = useState(""); // Estado para editar o video_id
  const [videos, setVideos] = useState<any[]>([]); // Lista de vídeos para o select
  const router = useRouter(); // Para redirecionamento

  // Função para carregar os vídeos do servidor
  const fetchVideos = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/all_videos");
      if (Array.isArray(response.data)) {
        setVideos(response.data); // Preenche a lista de vídeos se a resposta for um array
      } else {
        console.error("Erro: A resposta da API não é um array.");
      }
    } catch (error) {
      console.error("Erro ao carregar os vídeos:", error);
    }
  };

  useEffect(() => {
    // Carrega a lista de vídeos do servidor quando a página é carregada
    fetchVideos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(e.target.value);
  };

  const handleVideoIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVideoId(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Por favor, selecione um vídeo.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("description", description);

    try {
      // Envia o vídeo para a API para ser carregado
      const response = await axios.post("http://localhost:8080/api/all_videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Vídeo enviado com sucesso:", response.data);
      alert("Vídeo enviado com sucesso!");

      // Armazenando os dados do vídeo enviado
      setVideoData({
        videoId: response.data.video_id,
        videoPath: response.data.video_path, // Caminho do vídeo
        status: "mp4", // Supondo que o status seja "mp4"
      });

      // Atualiza a lista de vídeos após o envio do novo vídeo
      setVideos((prevVideos) => [...prevVideos, response.data]); // Atualiza a lista de vídeos com o novo vídeo enviado

    } catch (error) {
      console.error("Erro ao enviar o vídeo:", error);
      alert("Falha ao enviar o vídeo.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVideo = async () => {
    if (!videoId || !status) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = {
        video_id: videoId,
        video_path: videoData?.videoPath,
        status: status,
      };

      // Envia uma requisição PATCH para atualizar o vídeo com o status e video_id editados
      const response = await axios.patch(`http://localhost:8080/api/all_videos/${videoId}`, formDataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Vídeo atualizado com sucesso:", response.data);
      alert("Vídeo atualizado com sucesso!");

      // Redireciona para a página de vídeos após a atualização
      router.push("/allvideos/allvideos");

    } catch (error) {
      console.error("Erro ao atualizar o vídeo:", error);
      alert("Erro ao atualizar o vídeo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="p-4">
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm">Vídeo</label>
            <input type="file" onChange={handleFileChange} className="mt-2" />
          </div>

          <div className="mt-4">
            <label className="block text-sm">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              className="mt-2 border border-gray-300 p-2 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="mt-6 bg-blue-500 text-white p-3 rounded-md"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Enviar Vídeo"}
          </button>
        </form>

        {/* Exibe o painel de edição após o envio do vídeo */}
        {videoData && (
          <div className="mt-6 p-4 border border-gray-300 rounded-md">
            <h3 className="text-lg font-bold">Editar Vídeo</h3>
            <p><strong>Video Path:</strong> {videoData.videoPath}</p> {/* Exibe o nome do vídeo enviado */}
            <div>
              <label htmlFor="video_id" className="block text-gray-700">Vídeo</label>
              <select
                id="video_id"
                name="video_id"
                value={videoId}
                onChange={handleVideoIdChange}  // Aqui é o handleSelectChange
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select a Video</option>
                {Array.isArray(videos) && videos.map((video) => (
                  <option key={video.id} value={video.id}>
                    {video.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm">Status</label>
              <input
                type="text"
                value={status}
                onChange={handleStatusChange}
                className="mt-2 border border-gray-300 p-2 rounded-md"
              />
            </div>

            <button
              onClick={handleUpdateVideo}
              className="mt-4 bg-green-500 text-white p-3 rounded-md"
              disabled={loading}
            >
              {loading ? "Carregando..." : "Atualizar Vídeo"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AddVideoPage;
