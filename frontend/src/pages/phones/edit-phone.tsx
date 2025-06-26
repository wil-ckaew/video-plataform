// src/pages/phones/edit-phone.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

const EditPhonePage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();
  const { id } = router.query;

  const [number, setNumber] = useState('');
  const [phoneType, setPhoneType] = useState('mobile');
  const [userId, setUserId] = useState('');
  const [parentId, setParentId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [guardianId, setGuardianId] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [guardians, setGuardians] = useState<any[]>([]);

  // Busca os dados dos selects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, p, s, g] = await Promise.all([
          axios.get(`${apiUrl}/api/users`),
          axios.get(`${apiUrl}/api/parents`),
          axios.get(`${apiUrl}/api/students`),
          axios.get(`${apiUrl}/api/guardians`),
        ]);
        setUsers(u.data.users);
        setParents(p.data.parents);
        setStudents(s.data.students);
        setGuardians(g.data.guardians);
      } catch (err) {
        console.error('Erro ao carregar dados relacionados:', err);
      }
    };
    fetchData();
  }, [apiUrl]);

  // Busca o telefone pelo id e preenche o formulário
  useEffect(() => {
    if (!id || Array.isArray(id)) return;
    axios.get(`${apiUrl}/api/phones/${id}`)
      .then(res => {
        const phone = res.data.phone;
        setNumber(phone.number || '');
        setPhoneType(phone.phone_type || 'mobile');
        setUserId(phone.user_id || '');
        setParentId(phone.parent_id || '');
        setStudentId(phone.student_id || '');
        setGuardianId(phone.guardian_id || '');
      })
      .catch(err => {
        console.error('Erro ao buscar telefone:', err);
      });
  }, [apiUrl, id]);

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || Array.isArray(id)) {
      alert('ID inválido');
      return;
    }

    try {
      await axios.patch(`${apiUrl}/api/phones/${id}`, {
        number,
        phone_type: phoneType,
        user_id: userId || null,
        parent_id: parentId || null,
        student_id: studentId || null,
        guardian_id: guardianId || null,
      });
      alert('Telefone atualizado com sucesso!');
      router.push('/phones/phones');
    } catch (error) {
      console.error('Erro ao atualizar telefone:', error);
      alert('Erro ao atualizar telefone.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Editar Telefone</h1>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium">Número</label>
            <input
              type="text"
              className="mt-1 block w-full border rounded px-3 py-2"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Tipo</label>
            <select
              className="mt-1 block w-full border rounded px-3 py-2"
              value={phoneType}
              onChange={(e) => setPhoneType(e.target.value)}
              required
            >
              <option value="home">Residencial</option>
              <option value="work">Trabalho</option>
              <option value="mobile">Celular</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Usuário</label>
            <select
              className="mt-1 block w-full border rounded px-3 py-2"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">-- Nenhum --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Parente</label>
            <select
              className="mt-1 block w-full border rounded px-3 py-2"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">-- Nenhum --</option>
              {parents.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Aluno</label>
            <select
              className="mt-1 block w-full border rounded px-3 py-2"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">-- Nenhum --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Responsável</label>
            <select
              className="mt-1 block w-full border rounded px-3 py-2"
              value={guardianId}
              onChange={(e) => setGuardianId(e.target.value)}
            >
              <option value="">-- Nenhum --</option>
              {guardians.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Atualizar
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditPhonePage;
