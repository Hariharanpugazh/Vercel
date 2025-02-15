import { Filter } from 'lucide-react';

const QuestionFilters = ({ filters, toggleFilter, clearFilters, availableTags }) => {
  const hasActiveFilters = filters.level.length > 0 || filters.tags.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Difficulty Level</h4>
          <div className="space-y-2">
            {['easy', 'medium', 'hard'].map(level => (
              <label key={level} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.level.includes(level)}
                  onChange={() => toggleFilter('level', level)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700 capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableTags.map(tag => (
              <label key={tag} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.tags.includes(tag)}
                  onChange={() => toggleFilter('tags', tag)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">{tag}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionFilters;