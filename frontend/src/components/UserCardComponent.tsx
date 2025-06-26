// src/components/UserCardComponent.tsx
import React from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string | null;
}

interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;  // Adicionar onEdit como uma prop
  onDelete: (id: string) => void; // Adicionar onDelete como uma prop
}

const UserCardComponent: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 flex justify-between items-center">
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-800">{user.username}</h3>
        <p className="text-gray-700">ID: {user.id}</p>
        <p className="text-gray-700">Role: {user.role}</p>
        <p className="text-gray-500 text-sm">Created At: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(user.id)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default UserCardComponent;
