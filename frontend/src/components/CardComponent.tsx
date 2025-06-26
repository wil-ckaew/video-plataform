import React from 'react';

interface Card {
  id: string; // UUID
  name: string;
  email: string;
  phone: string; // Telefone como string
}

const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4 hover:bg-green-50 transition duration-300">
      <div className="text-sm text-gray-600">ID: {card.id}</div>
      <div className="text-lg font-semibold text-gray-800">{card.name}</div>
      <div className="text-md text-gray-700">{card.email}</div>
      <div className="text-md text-gray-700">{card.phone}</div> {/* Exibindo telefone */}
    </div>
  );
};

export default CardComponent;
