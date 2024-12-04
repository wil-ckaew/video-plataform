// src/components/TaskCardComponent.tsx
import React from 'react';

interface Task {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface TaskCardComponentProps {
  task: Task;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskCardComponent: React.FC<TaskCardComponentProps> = ({ task, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold">{task.title}</h3>
      <p className="text-gray-600">{task.content}</p>
      <p className="text-gray-400 text-sm">Created at: {new Date(task.created_at).toLocaleDateString()}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => onEdit(task.id)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCardComponent;
