"use client";

import React from "react";

const FullPageLoader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
      <p className="text-gray-700 text-lg">{message}</p>
    </div>
  );
};

export default FullPageLoader;
