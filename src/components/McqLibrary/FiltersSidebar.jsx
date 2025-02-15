import React, { useState } from 'react';
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FiltersSidebar = ({ filters, toggleFilter, clearFilters, availableTags }) => {
  const [isLevelOpen, setIsLevelOpen] = useState(true);
  const [isTagOpen, setIsTagOpen] = useState(true);

  const styles = {
    customBlue: {
      backgroundColor: 'rgba(0, 41, 107, 0.030)',
      color: '#000975',
      borderRadius: '0.375rem',
      padding: '0.5rem',
    },
    checkboxStyle: {
      backgroundColor: 'rgba(0, 41, 107, 0.2)',
      borderColor: '#000975',
      color: '#000975',
    },
    textStyle: {
      color: '#111933',
    },
    iconStyle: {
      color: '#111933',
    },
  };

  // Helper function to convert a lowercase string to camel case
  const toCamelCase = (str) => {
    return str.replace(/(^|\s)\S/g, (t) => t.toUpperCase());
  };

  return (
    <div className="flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6  top-8 ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={styles.textStyle}>
            <FaFilter style={{ color: '#ffcc00' }} />
            Filters
          </h3>
          {(filters.level.length > 0 || filters.tags.length > 0) && (
            <button onClick={clearFilters} className="text-sm font-semibold" style={styles.textStyle}>
              Clear All
            </button>
          )}
        </div>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center justify-between cursor-pointer" style={styles.textStyle} onClick={() => setIsLevelOpen(!isLevelOpen)}>
              Difficulty Level
              {isLevelOpen ? <FaChevronUp style={styles.iconStyle} /> : <FaChevronDown style={styles.iconStyle} />}
            </h4>
            <div className={`space-y-2 transition-max-height duration-300 ease-in-out overflow-hidden ${isLevelOpen ? 'max-h-96' : 'max-h-0'}`}>
              {isLevelOpen && (
                <div className="space-y-2 text-sm">
                  {['easy', 'medium', 'hard'].map(level => (
                    <label key={level} className="flex items-center text-sm" style={styles.customBlue}>
                      <input type="checkbox" checked={filters.level.includes(level)} onChange={() => toggleFilter('level', level)} style={styles.checkboxStyle} />
                      <span className="ml-2 capitalize text-sm" style={styles.textStyle}>{level}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center justify-between cursor-pointer" style={styles.textStyle} onClick={() => setIsTagOpen(!isTagOpen)}>
              Tag
              {isTagOpen ? <FaChevronUp style={styles.iconStyle} /> : <FaChevronDown style={styles.iconStyle} />}
            </h4>
            <div className={`space-y-2 max-h-56 overflow-y-auto transition-max-height duration-300 ease-in-out overflow-hidden ${isTagOpen ? 'max-h-96' : 'max-h-0'}`}>
              {isTagOpen && (
                <div className="space-y-2 max-56 overflow-y-auto">
                  {availableTags.map(tag => (
                    <label key={tag} className="flex items-center text-sm" style={styles.customBlue}>
                      <input type="checkbox" checked={filters.tags.includes(tag)} onChange={() => toggleFilter('tags', tag)} style={styles.checkboxStyle} />
                      <span className="ml-2 text-sm" style={styles.textStyle}>{toCamelCase(tag)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;
