export default function BusFilters({ filters, setFilters }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Filters</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">A/C Status</label>
        <div className="space-y-2">
          {['any', 'ac', 'non-ac'].map(type => (
            <label key={type} className="flex items-center gap-3">
              <input 
                type="radio" 
                name="ac" 
                value={type}
                checked={filters.ac === type}
                onChange={(e) => setFilters({...filters, ac: e.target.value})}
                className="text-[#121619] focus:ring-[#121619]"
              />
              <span className="text-gray-600 capitalize">{type === 'ac' ? 'A/C' : type === 'any' ? 'Any' : 'Non A/C'}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Seating Type</label>
        <div className="space-y-2">
          {['any', 'sleeper', 'semi-sleeper', 'seater'].map(type => (
            <label key={type} className="flex items-center gap-3">
              <input 
                type="radio" 
                name="type" 
                value={type}
                checked={filters.type === type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="text-[#121619] focus:ring-[#121619]"
              />
              <span className="text-gray-600 capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Minimum Rating</label>
        <input 
          type="range" 
          min="0" max="5" step="1" 
          value={filters.minRating}
          onChange={(e) => setFilters({...filters, minRating: parseInt(e.target.value)})}
          className="w-full accent-[#121619]"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Any</span>
          <span>5 Stars</span>
        </div>
      </div>
      
      <button 
        onClick={() => setFilters({ ac: 'any', type: 'any', minRating: 0 })}
        className="w-full py-2 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
