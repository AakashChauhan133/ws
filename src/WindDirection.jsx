import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp } from 'react-icons/fa';

const Skeleton = ({ className }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const WindDirectionCard = ({ liveDataLoading, windDirection, windSpeed }) => {
  // Map wind direction text to degrees
  const directionAngles = {
    N: 0,
    NE: 45,
    E: 90,
    SE: 135,
    S: 180,
    SW: 225,
    W: 270,
    NW: 315
  };

  // Default to 0° if value is unexpected
  const rotation = directionAngles[windDirection] ?? 0;

  return (
    <div className="border border-gray-200 p-6 rounded-xl shadow-md bg-white text-center hover:shadow-lg">
      <h3 className="text-xl font-semibold text-purple-700 mb-4">Wind Direction</h3>

      {liveDataLoading ? (
        <Skeleton className="w-full h-[200px]" />
      ) : (
        <div className="relative w-32 h-32 mx-auto rounded-full border-8 border-purple-500 flex items-center justify-center bg-gray-50">
          {/* Arrow rotates to match wind direction */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="text-purple-700 text-4xl"
          >
            <FaArrowUp />
          </motion.div>

          {/* Direction label */}
          <div className="absolute bottom-2 text-sm font-semibold text-purple-700">
            {windDirection}
          </div>
        </div>
      )}

      <p className="mt-3 text-sm text-gray-600">Wind Speed: {windSpeed} km/h</p>
    </div>
  );
};

export default WindDirectionCard;
