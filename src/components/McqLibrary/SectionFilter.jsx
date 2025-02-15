// SectionFilter.js
import React from 'react';

const SectionFilter = ({ sections, toggleFilter, filters }) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">Section</h3>
      <div className="space-y-2">
        {sections.map(section => (
          <label key={section} className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={filters.section.includes(section)}
              onChange={() => toggleFilter('section', section)}
            />
            <span className="ml-2">{section}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SectionFilter;
