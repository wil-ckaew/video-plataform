import React from 'react';

interface Document {
  id: string;
  student_id: string;
  doc_type: string;
  filename: string;
  created_at: string;
}

interface DocumentCardComponentProps {
  document: Document;
  name: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: () => void;
}

const DocumentCardComponent: React.FC<DocumentCardComponentProps> = ({
  document,
  name,
  onEdit,
  onDelete,
  onView,
}) => {
  if (!document) return null;

  return (
    <div className="bg-white shadow-md rounded p-4 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">{document.filename}</span>
        <div className="flex space-x-2">
          <button onClick={onView} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
            View
          </button>
          <button onClick={() => onEdit(document.id)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
            Edit
          </button>
          <button onClick={() => onDelete(document.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
      <div className="text-gray-700 text-sm">
        <p><strong>Student ID:</strong> {document.student_id}</p>
        <p><strong>name:</strong> {name}</p>
        <p><strong>Document Type:</strong> {document.doc_type}</p>
        <p><strong>Created At:</strong> {new Date(document.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default DocumentCardComponent;
