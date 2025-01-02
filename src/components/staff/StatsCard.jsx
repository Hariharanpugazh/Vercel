import React from 'react';

const StatsCard = ({ icon, title, value }) => {
  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm flex items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-full">
          {icon}
        </div>
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
      </div>
    </>
  );
};

export default StatsCard;