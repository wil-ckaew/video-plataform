import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CardComponent from './CardComponent';

interface Parent {
  id: string; // Alterado para string, pois o ID é um UUID
  name: string;
  email: string;
  phone: string;
  created_at: string; // Adicionado para lidar com a resposta completa
}

interface ParentInterfaceProps {
  backendName: string;
}

const ParentInterface: React.FC<ParentInterfaceProps> = ({ backendName }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const [parents, setParents] = useState<Parent[]>([]);
  const [newParent, setNewParent] = useState({ name: '', email: '', phone: '' });
  const [updateParent, setUpdateParent] = useState({ id: '', name: '', email: '', phone: '' });
  const [error, setError] = useState<string | null>(null);

  // Define styles based on the backend name
  const backgroundColors: { [key: string]: string } = {
    rust: 'bg-orange-500',
  };

  const buttonColors: { [key: string]: string } = {
    rust: 'bg-orange-700 hover:bg-orange-600',
  };

  const bgColor = backgroundColors[backendName as keyof typeof backgroundColors] || 'bg-gray-200';
  const btnColor = buttonColors[backendName as keyof typeof buttonColors] || 'bg-gray-500 hover:bg-gray-600';

  // Fetch parents
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/${backendName}/parents`);
        if (response.data.status === 'success') {
          setParents(response.data.parents.reverse());
        } else {
          setError('Error fetching data: ' + response.data.message);
        }
      } catch (error) {
        setError('Error fetching data: ' + (error as Error).message);
      }
    };

    fetchData();
  }, [backendName, apiUrl]);

  // Create a parent
  const createParent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/${backendName}/parents`, newParent);
      if (response.data.status === 'success') {
        setParents([response.data.parent, ...parents]);
        setNewParent({ name: '', email: '', phone: '' });
      } else {
        setError('Error creating parent: ' + response.data.message);
      }
    } catch (error) {
      setError('Error creating parent: ' + (error as Error).message);
    }
  };

  // Update a parent
  const handleUpdateParent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`${apiUrl}/api/${backendName}/parents/${updateParent.id}`, {
        name: updateParent.name,
        email: updateParent.email,
        phone: updateParent.phone
      });
      if (response.data.status === 'success') {
        setParents(parents.map((parent) =>
          parent.id === updateParent.id
            ? { ...parent, name: updateParent.name, email: updateParent.email, phone: updateParent.phone }
            : parent
        ));
        setUpdateParent({ id: '', name: '', email: '', phone: '' });
      } else {
        setError('Error updating parent: ' + response.data.message);
      }
    } catch (error) {
      setError('Error updating parent: ' + (error as Error).message);
    }
  };

  // Delete a parent
  const deleteParent = async (parentId: string) => {
    try {
      const response = await axios.delete(`${apiUrl}/api/${backendName}/parents/${parentId}`);
      if (response.status === 204) {
        setParents(parents.filter((parent) => parent.id !== parentId));
      } else {
        setError('Error deleting parent: ' + response.data.message);
      }
    } catch (error) {
      setError('Error deleting parent: ' + (error as Error).message);
    }
  };

  return (
    <div className={`parent-interface ${bgColor} ${backendName} w-full max-w-md p-4 my-4 rounded shadow`}>
      <img src={`/${backendName}logo.svg`} alt={`${backendName} Logo`} className="w-20 h-20 mb-6 mx-auto" />
      <h2 className="text-xl font-bold text-center text-white mb-6">{`${backendName.charAt(0).toUpperCase() + backendName.slice(1)} Projeto 4 Linhas`}</h2>
      
      {error && <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>}

      {/* Form to add new parent */}
      <form onSubmit={createParent} className="mb-6 p-4 bg-blue-100 rounded shadow">
        <input
          placeholder="Name"
          value={newParent.name}
          onChange={(e) => setNewParent({ ...newParent, name: e.target.value })}
          className="mb-2 w-full p-2 border border-gray-300 rounded"
        />
        <input
          placeholder="Email"
          value={newParent.email}
          onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
          className="mb-2 w-full p-2 border border-gray-300 rounded"
        />
        <input
          placeholder="Phone"
          value={newParent.phone}
          onChange={(e) => setNewParent({ ...newParent, phone: e.target.value })}
          className="mb-2 w-full p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          Add Parent
        </button>
      </form>

      {/* Form to update parent */}
      <form onSubmit={handleUpdateParent} className="mb-6 p-4 bg-blue-100 rounded shadow">
        <input
          placeholder="Parent ID"
          value={updateParent.id}
          onChange={(e) => setUpdateParent({ ...updateParent, id: e.target.value })}
          className="mb-2 w-full p-2 border border-gray-300 rounded"
        />
        <input
          placeholder="New Name"
          value={updateParent.name}
          onChange={(e) => setUpdateParent({ ...updateParent, name: e.target.value })}
          className="mb-2 w-full p-2 border border-gray-300 rounded"
        />
        <input
          placeholder="New Email"
          value={updateParent.email}
          onChange={(e) => setUpdateParent({ ...updateParent, email: e.target.value })}
          className="mb-2 w-full p-2 border border-gray-300 rounded"
        />
        <input
          placeholder="New Phone"
          value={updateParent.phone}
          onChange={(e) => setUpdateParent({ ...updateParent, phone: e.target.value })}
          className="mb-2 w-full p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600">
          Update Parent
        </button>
      </form>

      {/* Display parents */}
      <div className="space-y-4">
        {parents.length > 0 ? (
          parents.map((parent) => (
            <div key={parent.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <CardComponent card={parent} />
              <button onClick={() => deleteParent(parent.id)} className={`${btnColor} text-white py-2 px-4 rounded`}>
                Delete Parent
              </button>
            </div>
          ))
        ) : (
          <p>No parents found.</p>
        )}
      </div>
    </div>
  );
};

export default ParentInterface;
