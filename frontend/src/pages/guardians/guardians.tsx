import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

interface Guardian {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  guardians_date: string;
}

const GuardiansPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [selectedName, setSelectedName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchGuardians = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/guardians`);
        setGuardians(res.data.guardians);
      } catch {
        setGuardians([]);
      }
    };
    fetchGuardians();
  }, [apiUrl]);

  const filteredGuardians = selectedName
    ? guardians.filter((g) =>
        g.name.toLowerCase().includes(selectedName.toLowerCase())
      )
    : guardians;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Responsáveis</h1>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Select por nome */}
              <select
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Filtrar por nome</option>
                {Array.from(new Set(guardians.map((g) => g.name))).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Botão de adicionar */}
              <button
                onClick={() => router.push('/guardians/add-guardian')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
              >
                Novo Responsável
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Nome</th>
                  <th className="px-4 py-2 border">Parentesco</th>
                  <th className="px-4 py-2 border">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuardians.map((g) => (
                  <tr key={g.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border">{g.name}</td>
                    <td className="px-4 py-2 border">{g.relationship}</td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => router.push(`/guardians/edit-guardian?id=${g.id}`)}
                        className="text-blue-600 hover:underline mr-4"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredGuardians.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">
                      Nenhum responsável encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuardiansPage;
