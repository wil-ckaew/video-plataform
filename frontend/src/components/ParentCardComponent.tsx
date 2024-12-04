// src/components/ParentCardComponent.tsx
import React from 'react';

interface ParentCardProps {
  parent: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ParentCardComponent: React.FC<ParentCardProps> = ({ parent, onEdit, onDelete }) => {
  return (
    <div className="bg-white border rounded-lg shadow-md p-4 flex justify-between items-center">
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{parent.name}</h3>
        <p className="text-gray-600">Email: {parent.email}</p>
        <p className="text-gray-600">Phone: {parent.phone}</p>
      </div>
      <div className="ml-4 flex-shrink-0">
        <button
          onClick={() => onEdit(parent.id)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(parent.id)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ParentCardComponent;
