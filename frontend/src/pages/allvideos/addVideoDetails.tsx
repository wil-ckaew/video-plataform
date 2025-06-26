import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const AddVideoDetailsPage: React.FC = () => {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!status) {
      alert("Por favor, adicione um status.");
      return;
    }

    setLoading(true);

    try {
      // Supondo que você tenha o videoId salvo no localStorage ou vindo da URL
      const videoId = localStorage.getItem('videoId'); 

      const response = await axios.post('http://localhost:8080/api/video/details', {
        videoId,
        status,
      });

      alert("Status do vídeo atualizado com sucesso!");
      router.push('/allvideos/allvideos');  // Redireciona para a lista de vídeos
    } catch (error) {
      console.error("Erro ao adicionar o status:", error);
      alert("Falha ao adicionar o status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Adicionar Detalhes do Vídeo</h1>
      <form onSubmit={handleSubmit}>
        <label>Status</label>
        <input
          type="text"
          value={status}
          onChange={handleStatusChange}
          placeholder="Status do vídeo"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Carregando..." : "Adicionar Status"}
        </button>
      </form>
    </div>
  );
};

export default AddVideoDetailsPage;
