// src/components/StudentCardComponent.tsx

import React from 'react';

interface Student {
  id: string;
  name: string;
  age: number;
  email?: string;  // Email opcional
  students_date?: string;  // Data opcional
  parent_name?: string;  // Nome do responsável opcional
}

interface StudentCardProps {
  student: Student;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const StudentCardComponent: React.FC<StudentCardProps> = ({ student, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
        <div className="flex space-x-2">
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            onClick={() => onEdit(student.id)}
          >
            Editar
          </button>
          <button
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            onClick={() => onDelete(student.id)}
          >
            Deletar
          </button>
        </div>
      </div>

      <p className="text-gray-700 mb-2">Idade: {student.age}</p>
      <p className="text-gray-700 mb-2">Email: {student.email || 'N/A'}</p>
      
      {/* Exibe o nome do responsável ao invés do ID */}
      <p className="text-gray-700 mb-2">
      Responsável: {student.parent_name || <span className="text-red-500">"Não encontrado"</span>}
    </p>
      
      <p className="text-gray-500 text-sm">
        Data de Registro: {student.students_date ? new Date(student.students_date).toLocaleDateString() : 'N/A'}
      </p>
    </div>
  );
};

export default StudentCardComponent;
