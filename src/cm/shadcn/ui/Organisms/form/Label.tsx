import React from 'react';

export default function Label({children, required = false}) {
  return (
    <label className="block text-sm mb-1 text-gray-500 ">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
