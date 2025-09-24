"use client";
import React from "react";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  lastPage,
  onPageChange,
}) => {
  if (lastPage <= 1) return null;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-between items-center mt-6">
      {/* Info halaman */}
      <p className="text-sm text-gray-600">
        Halaman <span className="font-semibold">{currentPage}</span> dari{" "}
        <span className="font-semibold">{lastPage}</span>
      </p>

      {/* Tombol navigasi */}
      <div className="flex space-x-2">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md disabled:opacity-50"
        >
          « First
        </button>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md disabled:opacity-50"
        >
          ‹ Prev
        </button>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="px-3 py-1 border rounded-md disabled:opacity-50"
        >
          Next ›
        </button>
        <button
          onClick={() => goToPage(lastPage)}
          disabled={currentPage === lastPage}
          className="px-3 py-1 border rounded-md disabled:opacity-50"
        >
          Last »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
