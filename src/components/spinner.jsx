"use client";

import React from 'react';

/**
 * A simple, reusable spinner component styled with Tailwind CSS.
 * You can customize its size, color, and border thickness via props.
 */
const Spinner = ({ size = 'w-12 h-12', color = 'border-green-700', thickness = 'border-4' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-900"></div>
    </div>
  );
};

export default Spinner;
