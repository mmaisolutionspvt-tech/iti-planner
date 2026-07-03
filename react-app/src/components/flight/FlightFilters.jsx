export default function FlightFilters({ filters, setFilters }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Filters</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Stops</label>
        <div className="space-y-2">
          {['any', '0', '1', '2'].map(stops => (
            <label key={stops} className="flex items-center gap-3">
              <input 
                type="radio" 
                name="stops" 
                value={stops}
                checked={filters.stops === stops}
                onChange={(e) => setFilters({...filters, stops: e.target.value})}
                className="text-[#121619] focus:ring-[#121619]"
              />
              <span className="text-gray-600 capitalize">
                {stops === 'any' ? 'Any Stops' : stops === '0' ? 'Non-Stop' : `${stops} Stop(s)`}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Max Price (₹)</label>
        <input 
          type="range" 
          min="2000" max="50000" step="500" 
          value={filters.maxPrice}
          onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
          className="w-full accent-[#121619]"
        />
        <div className="flex justify-between text-xs font-semibold text-[#121619] mt-2">
          <span>₹2,000</span>
          <span>₹{filters.maxPrice.toLocaleString()}</span>
        </div>
      </div>
      
      <button 
        onClick={() => setFilters({ stops: 'any', airlines: [], maxPrice: 50000 })}
        className="w-full py-2 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
