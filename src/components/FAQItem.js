'use client';

import { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-md font-medium text-gray-900">{question}</h3>
        <svg
          className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default FAQItem;
