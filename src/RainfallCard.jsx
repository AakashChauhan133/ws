import React from 'react';
import { FaCloudRain } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RainfallCard = ({ liveDataLoading, rainfall }) => {
  const Skeleton = ({ className }) => (
    <div
      className={`bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-[length:200%_100%] animate-pulse rounded ${className}`}
    />
  );

  return (
    <div className="border border-gray-100 p-6 rounded-2xl shadow-md bg-gradient-to-b from-white to-blue-50 text-center transition-all duration-300 hover:shadow-lg">
      {/* Icon */}
      <div className="flex justify-center items-center mb-4">
        <div className="bg-blue-100 rounded-full p-3">
          <FaCloudRain className="text-blue-500 text-3xl" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-sky-800 mb-2 tracking-wide">
        Rainfall (mm)
      </h3>

      {/* Value or Skeleton */}
      {liveDataLoading ? (
        <div className="flex justify-center mt-4">
          <Skeleton className="w-40 h-28" /> {/* Matches number size */}
        </div>
      ) : (
        <motion.p
          className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-sky-400 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {rainfall}
        </motion.p>
      )}
    </div>
  );
};

export default RainfallCard;
