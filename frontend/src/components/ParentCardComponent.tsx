// src/components/ParentCardComponent.tsx
// src/components/ParentCardComponent.tsx

interface Parent {
  id: string;
  user_id: string;
  name: string;
  email: string;
  parents_date: string;
}

interface Props {
  parent: Parent;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ParentCardComponent: React.FC<Props> = ({ parent, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-4 shadow rounded-md">
      <h3 className="text-lg font-semibold">{parent.name}</h3>
      <p className="text-sm text-gray-600">Email: {parent.email}</p>
      <p className="text-sm text-gray-500">Cadastrado em: {new Date(parent.parents_date).toLocaleDateString()}</p>
      <div className="mt-2 flex space-x-2">
        <button
          onClick={() => onEdit(parent.id)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(parent.id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Excluir
        </button>
      </div>
    </div>
  );
};

export default ParentCardComponent;
