import React, { useEffect, useState, useMemo, Fragment } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

interface Phone {
  id: string;
  number: string;
  phone_type: 'home' | 'work' | 'mobile';
  student_id?: string;
  student_name?: string;
}

const PhonesPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Phone | null>(null);
  const [query, setQuery] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/phones`);
        setPhones(res.data.phones);
        setError(null);
      } catch {
        setError('Erro ao carregar os telefones');
      } finally {
        setLoading(false);
      }
    };
    fetchPhones();
  }, [apiUrl]);

  const uniqueStudents = useMemo(() => {
    const map = new Map<string, Phone>();
    for (const p of phones) {
      if (p.student_id && !map.has(p.student_id)) {
        map.set(p.student_id, p);
      }
    }
    return Array.from(map.values());
  }, [phones]);

  const filteredStudents = query === ''
    ? uniqueStudents
    : uniqueStudents.filter(s =>
        s.student_name?.toLowerCase().includes(query.toLowerCase())
      );

  const filteredPhones = useMemo(() => {
    if (!selectedStudent) return phones;
    return phones.filter(p => p.student_id === selectedStudent.student_id);
  }, [phones, selectedStudent]);

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente deletar este telefone?')) return;
    try {
      await axios.delete(`${apiUrl}/api/phones/${id}`);
      setPhones(prev => prev.filter(p => p.id !== id));
      alert('Telefone deletado com sucesso.');
    } catch {
      alert('Erro ao deletar telefone.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
          <h1 className="text-2xl font-bold text-gray-800">Telefones</h1>
          <div className="flex items-center gap-2 w-full max-w-xs">
            <Combobox value={selectedStudent} onChange={setSelectedStudent}>
              <div className="relative mt-1">
                <Combobox.Input
                  className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 shadow-sm text-sm leading-5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onChange={(event) => setQuery(event.target.value)}
                  displayValue={(p: Phone) => p?.student_name || ''}
                  placeholder="Selecione um aluno..."
                />
                {(query !== '' || selectedStudent) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null);
                      setQuery('');
                    }}
                    className="absolute inset-y-0 right-8 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                    aria-label="Limpar seleção"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </Combobox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  afterLeave={() => setQuery('')}
                >
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredStudents.length === 0 && query !== '' ? (
                      <div className="cursor-default select-none py-2 px-4 text-gray-700">Nenhum aluno encontrado.</div>
                    ) : (
                      filteredStudents.map((student) => (
                        <Combobox.Option
                          key={student.student_id}
                          className={({ active }) =>
                            `cursor-default select-none relative py-2 pl-10 pr-4 ${
                              active ? 'bg-green-600 text-white' : 'text-gray-900'
                            }`
                          }
                          value={student}
                        >
                          {({ selected, active }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                {student.student_name}
                              </span>
                              {selected && (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? 'text-white' : 'text-green-600'
                                  }`}
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </span>
                              )}
                            </>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </Transition>
              </div>
            </Combobox>
            <button
              onClick={() => router.push('/phones/add-phone')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              Adicionar
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Carregando telefones...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : filteredPhones.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum telefone cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {filteredPhones.map((phone) => (
              <div key={phone.id} className="bg-white rounded shadow p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{phone.number}</p>
                  <p className="text-sm text-gray-500">Tipo: {phone.phone_type}</p>
                  {phone.student_name && (
                    <p className="text-sm text-gray-500">Aluno: {phone.student_name}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/phones/edit-phone?id=${phone.id}`)}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(phone.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PhonesPage;
