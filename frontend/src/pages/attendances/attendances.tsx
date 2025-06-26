// src/pages/attendances/attendances.tsx
import React, { useEffect, useState, useMemo, Fragment } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import { useRouter } from 'next/router';
import AttendanceDashboard from '../../components/AttendanceDashboard';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon  } from '@heroicons/react/20/solid';

interface Attendance {
  id: string;
  student_id: string;
  student_name: string;
  student_group_name?: string;
  attendance_date: string;
  status: 'presente' | 'falta';
  notes?: string;
}

const AttendancesPage: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Attendance | null>(null);
  const [query, setQuery] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/attendances`);
        setAttendances(res.data.attendances);
        setError(null);
      } catch {
        setError('Failed to load attendances');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendances();
  }, [apiUrl]);

  const uniqueStudents = useMemo(() => {
    const map = new Map<string, Attendance>();
    for (const att of attendances) {
      if (!map.has(att.student_id)) {
        map.set(att.student_id, att);
      }
    }
    return Array.from(map.values());
  }, [attendances]);

  const filteredStudents = query === ''
    ? uniqueStudents
    : uniqueStudents.filter(s =>
        s.student_name.toLowerCase().includes(query.toLowerCase())
      );

  const filteredAttendances = useMemo(() => {
    if (!selectedStudent) return attendances;
    return attendances.filter(a => a.student_id === selectedStudent.student_id);
  }, [attendances, selectedStudent]);

  const handleDelete = async (id: string) => {
    if (!confirm('Confirm delete attendance?')) return;
    try {
      await axios.delete(`${apiUrl}/api/attendances/${id}`);
      setAttendances(prev => prev.filter(a => a.id !== id));
      alert('Deleted successfully');
    } catch {
      alert('Error deleting attendance');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
          <h1 className="text-2xl font-bold text-gray-800">Attendances</h1>
          <div className="flex items-center gap-2 w-full max-w-xs">
          <Combobox value={selectedStudent} onChange={setSelectedStudent}>
  <div className="relative mt-1">
    <Combobox.Input
      className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 shadow-sm text-sm leading-5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
      onChange={(event) => setQuery(event.target.value)}
      displayValue={(att: Attendance) => att?.student_name || ''}
      placeholder="Selecione ou digite o nome do aluno..."
    />

    {/* BOTÃO LIMPAR */}
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
        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    )}

    {/* BOTÃO DE ABRIR COMBOBOX */}
    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
            Nenhum aluno encontrado.
          </div>
        ) : (
          filteredStudents.map((student) => (
            <Combobox.Option
              key={student.student_id}
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
                      selected ? 'font-semibold' : 'font-normal'
                    }`}
                  >
                    {student.student_name}
                    {student.student_group_name ? ` (${student.student_group_name})` : ''}
                  </span>
                  {selected && (
                    <span
                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                        active ? 'text-white' : 'text-green-600'
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


            <button
              onClick={() => router.push('/attendances/add-attendance')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              Add
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading attendances...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : filteredAttendances.length === 0 ? (
          <p className="text-center text-gray-500">No attendances recorded.</p>
        ) : (
          <>
            {/* Lista agrupada por aluno com clique para expandir */}
            {(selectedStudent ? [selectedStudent] : uniqueStudents).map((student) => {
              const studentRecords = attendances.filter(
                (a) => a.student_id === student.student_id
              );
              return (
                <div key={student.student_id} className="bg-white shadow rounded mb-3">
                  <button
                    onClick={() =>
                      setExpandedStudentId((prev) =>
                        prev === student.student_id ? null : student.student_id
                      )
                    }
                    className="w-full flex justify-between items-center px-4 py-2 text-left"
                  >
                    <div>
                      <span className="font-semibold">{student.student_name}</span>
                      {student.student_group_name && (
                        <span className="ml-2 text-sm text-gray-500 italic">
                          ({student.student_group_name})
                        </span>
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 transform transition-transform ${
                        expandedStudentId === student.student_id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedStudentId === student.student_id && (
                    <div className="px-4 pb-2">
                      {studentRecords.map((att) => (
                        <div
                          key={att.id}
                          className="flex justify-between items-center border-t py-2"
                        >
                          <div>
                            <p className="text-sm text-gray-800">
                              {new Date(att.attendance_date).toLocaleDateString('pt-BR')} –{' '}
                              <span
                                className={`font-semibold ${
                                  att.status === 'presente'
                                    ? 'text-green-700'
                                    : 'text-red-700'
                                }`}
                              >
                                {att.status.toUpperCase()}
                              </span>
                            </p>
                            {att.notes && (
                              <p className="text-xs text-gray-600 italic">{att.notes}</p>
                            )}
                          </div>
                          <div className="space-x-1">
                            <button
                              onClick={() =>
                                router.push(`/attendances/edit-attendance?id=${att.id}`)
                              }
                              className="text-blue-500 text-xs hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(att.id)}
                              className="text-red-500 text-xs hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Dashboard */}
            <AttendanceDashboard
              data={filteredAttendances}
              selectedStudentId={selectedStudent?.student_id}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default AttendancesPage;
