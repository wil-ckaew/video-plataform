import React, { useState } from "react";
import axios from "axios";
import Header from "../../components/Header";

const AddVideoPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
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
      const response = await axios.post("http://localhost:8080/api/all_videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Vídeo enviado com sucesso!");
      console.log(response.data);
    } catch (error) {
      console.error("Erro ao enviar o vídeo:", error);
      alert("Falha ao enviar o vídeo.");
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
      </main>
    </div>
  );
};

export default AddVideoPage;
