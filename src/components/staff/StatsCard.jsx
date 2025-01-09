import React from 'react';

const StatsCard = ({ icon, title, value }) => {
  return (
    <div className="bg-white p-3 font-sans rounded-2xl shadow-4xl hover:shadow-7xl transform hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-center text-center w-full">
    <div className="text-5xl text-[#000975] mb-4">{icon}</div>
    <p className="text-4xl text-gray-900 font-bold ">{value}</p>
    <h3 className="text-xl font-sans font-semibold text-gray-800 mt-2">{title}</h3>
  </div>
  );
};

export default StatsCard;
