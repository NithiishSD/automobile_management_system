import React from 'react';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition">
    <div className="flex justify-center mb-4 text-blue-900">
      {React.cloneElement(icon, { className: 'h-12 w-12' })}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default FeatureCard;
