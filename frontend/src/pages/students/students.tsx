// frontend/src/pages/students/students.tsx
import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

interface Student {
  id: string;
  name: string;
  age: number;
  email: string;
  parent_id?: string | null;
  parent_name?: string | null;
  students_date?: string;
}

const StudentCardComponent: React.FC<{
  student: Student;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ student, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">{student.name}</h2>
      <p>Idade: {student.age}</p>
      <p>Email: {student.email || 'N/A'}</p>
      <p>Responsável: {student.parent_name || 'N/A'}</p>
      <p>Cadastro: {student.students_date || 'N/A'}</p>
      <div className="mt-2 space-x-2">
        <button
          onClick={() => onEdit(student.id)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(student.id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Excluir
        </button>
      </div>
    </div>
  );
};

const StudentsPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/students`);
        setStudents(response.data.students || []);
        setError(null);
      } catch {
        setError('Erro ao buscar alunos');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [apiUrl]);

  const filteredStudents =
    query === ''
      ? students
      : students.filter((student) =>
          student.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto bg-gray-100 p-4 max-w-4xl mx-auto w-full">
          {/* Header com título, combobox e botão lado a lado responsivos */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
            <p className="text-gray-800 font-semibold text-xl whitespace-nowrap">
              Alunos
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Combobox com borda verde ao focar */}
              <div className="flex-grow min-w-[200px] max-w-md">
                <Combobox value={selectedStudent} onChange={setSelectedStudent}>
                  <div className="relative">
                    <div
                      className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md
                      focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 sm:text-sm border border-gray-300
                      transition"
                    >
                      <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                        displayValue={(student: Student) => student?.name || ''}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Selecione ou busque um aluno..."
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>

                      {(query !== '' || selectedStudent) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(null);
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
                        {filteredStudents.length === 0 && query !== '' ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Nenhum aluno encontrado.
                          </div>
                        ) : (
                          filteredStudents.map((student) => (
                            <Combobox.Option
                              key={student.id}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-green-600 text-white' : 'text-gray-900'
                                }`
                              }
                              value={student}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}
                                  >
                                    {student.name}
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
                onClick={() => router.push('/students/add-student')}
                className="whitespace-nowrap bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Adicionar Aluno
              </button>
            </div>
          </div>

          {/* Conteúdo da página */}
          {loading ? (
            <p className="text-center text-gray-600">Carregando...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : selectedStudent ? (
            <StudentCardComponent
              student={selectedStudent}
              onEdit={(id) => router.push(`/students/edit-student?id=${id}`)}
              onDelete={async (id) => {
                if (confirm('Tem certeza que deseja excluir este aluno?')) {
                  try {
                    await axios.delete(`${apiUrl}/api/students/${id}`);
                    setStudents((prev) => prev.filter((s) => s.id !== id));
                    setSelectedStudent(null);
                    alert('Aluno excluído com sucesso!');
                  } catch {
                    alert('Erro ao excluir aluno.');
                  }
                }
              }}
            />
          ) : students.length === 0 ? (
            <p className="text-center text-gray-600">Nenhum aluno encontrado.</p>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="w-full text-left p-3 bg-white rounded shadow hover:bg-gray-50 transition"
                >
                  {student.name}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentsPage;
