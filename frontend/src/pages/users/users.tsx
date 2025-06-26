// src/pages/users/users.tsx
import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

interface User {
  id: string;
  username: string;
  role: string;
  users_date: string | null;
  password_hash: string;
}

const UserCardComponent: React.FC<{
  user: User;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ user, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">{user.username}</h2>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Created At:</strong> {user.users_date ? new Date(user.users_date).toLocaleString() : 'N/A'}</p>
      <p><strong>Hashed Password:</strong> {user.password_hash}</p>
      <div className="mt-2 space-x-2">
        <button
          onClick={() => onEdit(user.id)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Excluir
        </button>
      </div>
    </div>
  );
};

const UsersPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users`);
        setUsers(response.data.users || []);
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Erro ao buscar usuários: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiUrl]);

  const filteredUsers =
    query === ''
      ? users
      : users.filter((user) =>
          user.username.toLowerCase().includes(query.toLowerCase())
        );

  const handleAddUser = () => {
    router.push('/users/add-user');
  };

  const handleEdit = (id: string) => {
    router.push(`/users/edit-user?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await axios.delete(`${apiUrl}/api/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
      alert('Usuário excluído com sucesso!');
    } catch {
      alert('Erro ao excluir usuário.');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-hidden bg-gray-100 p-4">
        <section className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
            <p className="text-gray-800 font-semibold text-xl whitespace-nowrap">Usuários</p>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Combobox com borda verde ao focar */}
              <div className="flex-grow min-w-[200px] max-w-md">
                <Combobox value={selectedUser} onChange={setSelectedUser}>
                  <div className="relative">
                    <div
                      className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md
                      focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 sm:text-sm border border-gray-300
                      transition"
                    >
                      <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                        displayValue={(user: User) => user?.username || ''}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Selecione ou busque um usuário..."
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>

                      {(query !== '' || selectedUser) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(null);
                            setQuery('');
                          }}
                          className="absolute inset-y-0 right-7 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                          aria-label="Limpar seleção"
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
                        {filteredUsers.length === 0 && query !== '' ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Nenhum usuário encontrado.
                          </div>
                        ) : (
                          filteredUsers.map((user) => (
                            <Combobox.Option
                              key={user.id}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-green-600 text-white' : 'text-gray-900'
                                }`
                              }
                              value={user}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}
                                  >
                                    {user.username}
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-green-300'
                                      }`}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
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
                onClick={handleAddUser}
                className="whitespace-nowrap bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Adicionar Usuário
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-600">Carregando...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : selectedUser ? (
            <UserCardComponent
              user={selectedUser}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : users.length === 0 ? (
            <p className="text-center text-gray-600">Nenhum usuário encontrado.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="w-full text-left p-3 bg-white rounded shadow hover:bg-gray-50 transition"
                >
                  {user.username}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UsersPage;
