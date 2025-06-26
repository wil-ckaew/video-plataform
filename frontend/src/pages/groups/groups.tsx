// frontend/src/pages/groups/groups.tsx
import React, { useEffect, useState, useMemo, Fragment } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

interface Group {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

const GroupsPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const groupTypes = ['pequenos', 'medios', 'grandes'];

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/groups`);
        setGroups(res.data.groups);
        setError(null);
      } catch {
        setError('Erro ao carregar os grupos');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [apiUrl]);

  const filteredGroups = useMemo(() => {
    if (!selectedGroupName) return groups;
    return groups.filter(g => g.name === selectedGroupName);
  }, [groups, selectedGroupName]);

  const filteredTypes = query === ''
    ? groupTypes
    : groupTypes.filter(type =>
        type.toLowerCase().includes(query.toLowerCase())
      );

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente deletar este grupo?')) return;
    try {
      await axios.delete(`${apiUrl}/api/groups/${id}`);
      setGroups(prev => prev.filter(g => g.id !== id));
      alert('Grupo deletado com sucesso.');
    } catch {
      alert('Erro ao deletar grupo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto w-full p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Grupos</h1>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-full max-w-xs">
              <Combobox value={selectedGroupName} onChange={setSelectedGroupName}>
                <div className="relative">
                  <Combobox.Input
                    className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 shadow-sm text-sm leading-5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    onChange={(event) => setQuery(event.target.value)}
                    displayValue={(value: string) => value || ''}
                    placeholder="Filtrar por turma"
                  />
                  {(query !== '' || selectedGroupName) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGroupName(null);
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
                      {filteredTypes.length === 0 ? (
                        <div className="cursor-default select-none py-2 px-4 text-gray-700">Nenhum tipo encontrado.</div>
                      ) : (
                        filteredTypes.map((type) => (
                          <Combobox.Option
                            key={type}
                            value={type}
                            className={({ active }) =>
                              `cursor-default select-none relative py-2 pl-10 pr-4 ${
                                active ? 'bg-green-600 text-white' : 'text-gray-900'
                              }`
                            }
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                  {type}
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
            </div>

            <button
              onClick={() => router.push('/groups/add-group')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              Adicionar
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Carregando grupos...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : filteredGroups.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum grupo encontrado.</p>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white rounded shadow p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800 capitalize">{group.name}</p>
                  {group.description && (
                    <p className="text-sm text-gray-500">{group.description}</p>
                  )}
                  {group.created_at && (
                    <p className="text-sm text-gray-400">Criado em: {new Date(group.created_at).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/groups/edit-group?id=${group.id}`)}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
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

export default GroupsPage;
