// src/components/AttendanceDashboard.tsx
// src/components/AttendanceDashboard.tsx
import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Attendance {
  id: string;
  student_id: string;
  student_name: string;
  attendance_date: string;
  status: 'presente' | 'falta';
  notes?: string;
}

interface Props {
    data: Attendance[];
    selectedStudentId?: string | null; // ✅ CORRETO
  }
  

const AttendanceDashboard: React.FC<Props> = ({ data, selectedStudentId }) => {
  const [showAbsences, setShowAbsences] = useState(false);
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const filtered = useMemo(() => {
    return data.filter((att) => {
      const date = new Date(att.attendance_date);
      const matchDate = date >= thirtyDaysAgo && date <= today;
      const matchStudent = selectedStudentId ? att.student_id === selectedStudentId : true;
      return matchDate && matchStudent;
    });
  }, [data, selectedStudentId]);

  const grouped = useMemo(() => {
    const map: Record<string, { date: string; presente: number; falta: number }> = {};
    for (const att of filtered) {
      const d = new Date(att.attendance_date).toLocaleDateString('pt-BR');
      if (!map[d]) map[d] = { date: d, presente: 0, falta: 0 };
      if (att.status === 'presente') map[d].presente++;
      else map[d].falta++;
    }
    return Object.values(map).sort((a, b) => {
      const da = new Date(a.date.split('/').reverse().join('-'));
      const db = new Date(b.date.split('/').reverse().join('-'));
      return da.getTime() - db.getTime();
    });
  }, [filtered]);

  const absences = useMemo(() => {
    return filtered
      .filter((a) => a.status === 'falta')
      .sort((a, b) => new Date(a.attendance_date).getTime() - new Date(b.attendance_date).getTime());
  }, [filtered]);

  const totalPresente = filtered.filter((a) => a.status === 'presente').length;
  const totalFalta = absences.length;
  const taxaPresenca = Math.round((totalPresente / (totalPresente + totalFalta || 1)) * 100);
  const diff =
    grouped.length > 1
      ? grouped[grouped.length - 1].presente - grouped[0].presente
      : 0;

  return (
    <div className="bg-white p-4 md:p-6 mt-4 rounded shadow-md md:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          Resumo dos últimos 30 dias
        </h2>
        <button
          className="flex items-center text-red-600 hover:underline text-sm"
          onClick={() => setShowAbsences(!showAbsences)}
        >
          {showAbsences ? (
            <>
              Ocultar faltas <ChevronUp className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Exibir faltas <ChevronDown className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        <div className="p-3 bg-green-100 rounded-xl text-center">
          <p className="text-xs text-gray-500">Presenças</p>
          <p className="text-xl font-bold text-green-700">{totalPresente}</p>
        </div>
        <div className="p-3 bg-red-100 rounded-xl text-center">
          <p className="text-xs text-gray-500">Faltas</p>
          <p className="text-xl font-bold text-red-700">{totalFalta}</p>
        </div>
        <div className="p-3 bg-blue-100 rounded-xl text-center">
          <p className="text-xs text-gray-500">Taxa de Presença</p>
          <p className="text-xl font-bold text-blue-700">{taxaPresenca}%</p>
        </div>
        <div className="p-3 bg-purple-100 rounded-xl text-center">
          <p className="text-xs text-gray-500">Tendência</p>
          <div className="flex justify-center items-center space-x-1">
            <p className="text-lg font-bold text-purple-700">
              {diff >= 0 ? '+' : ''}
              {diff}
            </p>
            {diff >= 0 ? (
              <ArrowUpRight className="text-green-600 w-4 h-4" />
            ) : (
              <ArrowDownRight className="text-red-600 w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 h-52 md:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grouped}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="presente" fill="#16a34a" name="Presenças" />
              <Bar dataKey="falta" fill="#dc2626" name="Faltas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {showAbsences && (
          <div className="bg-red-50 border border-red-200 p-4 rounded overflow-y-auto max-h-60 w-full md:w-1/2">
            <h3 className="font-semibold text-red-700 mb-2 text-sm">Dias com falta:</h3>
            <ul className="list-disc list-inside text-xs text-red-800 space-y-1">
              {absences.map((a) => (
                <li key={a.id}>
                  {new Date(a.attendance_date).toLocaleDateString('pt-BR')} – {a.student_name}
                  {a.notes && ` (${a.notes})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDashboard;
