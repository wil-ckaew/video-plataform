// src/pages/parents/parents.tsx
import React, { useState, useEffect, Fragment } from 'react';
import api from '../../utils/axiosConfig';
import ParentCardComponent from '../../components/ParentCardComponent';
import Header from '../../components/Header';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

interface Parent {
  id: string;
  user_id: string;
  name: string;
  email: string;
  parents_date: string;
}

const ParentsPage: React.FC = () => {
  const router = useRouter();

  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const response = await api.get('/api/parents');
        setParents(response.data.parents || []);
        setError(null);
      } catch (err) {
        const error = err as AxiosError;
        if (error.response) {
          setError(`Erro ao buscar pais: ${error.response.status} - ${error.response.statusText}`);
        } else {
          setError('Erro desconhecido ao buscar pais.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchParents();
  }, []);

  const filteredParents =
    query === ''
      ? parents
      : parents.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleAddParent = () => {
    router.push('/parents/add-parent');
  };

  const handleEdit = (id: string) => {
    router.push(`/parents/edit-parent?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Você tem certeza que deseja excluir este pai?')) return;
    try {
      await api.delete(`/api/parents/${id}`);
      setParents(prev => prev.filter(p => p.id !== id));
      if (selectedParent?.id === id) setSelectedParent(null);
      alert('Pai excluído com sucesso!');
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        alert(`Erro ao excluir pai: ${error.response.status} - ${error.response.statusText}`);
      } else {
        alert('Erro desconhecido ao excluir pai.');
      }
    }
  };

  // Função para limpar seleção e query
  const clearSelection = () => {
    setSelectedParent(null);
    setQuery('');
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4 max-w-4xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
          <h1 className="text-xl font-semibold text-gray-800 whitespace-nowrap">
            Lista de Pais
          </h1>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-grow min-w-[200px] max-w-md">
              <Combobox value={selectedParent} onChange={setSelectedParent}>
                <div className="relative">
                  <div
                    className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md
                    focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 sm:text-sm border border-gray-300
                    transition"
                  >
                    <Combobox.Input
                      className="w-full border-none py-2 pl-3 pr-12 text-sm leading-5 text-gray-900 focus:ring-0"
                      displayValue={(parent: Parent) => parent?.name || ''}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Selecione ou busque um pai..."
                    />

                    {/* Botão para abrir o dropdown */}
                    <Combobox.Button className="absolute inset-y-0 right-6 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Combobox.Button>

                    {/* Botão de limpar (X) aparece só se houver texto na busca */}
                    { (query !== '' || selectedParent) && (
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                        aria-label="Clear selection"
                      >
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                  >
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {filteredParents.length === 0 && query !== '' ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                          Nenhum pai encontrado.
                        </div>
                      ) : (
                        filteredParents.map(parent => (
                          <Combobox.Option
                            key={parent.id}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-green-600 text-white' : 'text-gray-900'
                              }`
                            }
                            value={parent}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? 'font-medium' : 'font-normal'
                                  }`}
                                >
                                  {parent.name}
                                </span>
                                {selected && (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active ? 'text-white' : 'text-green-300'
                                    }`}
                                  >
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
              onClick={handleAddParent}
              className="whitespace-nowrap bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Adicionar Pai
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Carregando...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : selectedParent ? (
          <ParentCardComponent
            parent={selectedParent}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : parents.length === 0 ? (
          <p className="text-center text-gray-600">Nenhum pai cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {parents.map(parent => (
              <button
                key={parent.id}
                onClick={() => setSelectedParent(parent)}
                className="w-full text-left p-3 bg-white rounded shadow hover:bg-gray-50 transition"
              >
                {parent.name}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ParentsPage;
