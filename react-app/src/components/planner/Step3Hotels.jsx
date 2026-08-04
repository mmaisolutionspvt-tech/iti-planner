import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faStar, 
  faSearch, 
  faArrowRight, 
  faArrowLeft,
  faHotel,
  faXmark,
  faSortAmountDown,
  faMoon,
  faListOl
} from '@fortawesome/free-solid-svg-icons';
import HotelCard from '../global/HotelCard';

export default function Step3Hotels({ 
  destination, 
  selectedHotels = [], 
  onToggleHotel, 
  onUpdateHotelConfig, 
  onNext, 
  onBack 
}) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchName, setSearchName] = useState('');
  const [priceRange, setPriceRange] = useState(16500);
  const [minStars, setMinStars] = useState(0);
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const res = await fetch('/src/data/hotels.json');
        const data = await res.json();
        
        const targetCity = (destination || '').toLowerCase().trim();
        let filtered = data.filter(h => h.city.toLowerCase().includes(targetCity) || targetCity.includes(h.city.toLowerCase()));
        
        if (filtered.length === 0) {
          filtered = data.slice(0, 30);
        }
        setHotels(filtered);
      } catch (err) {
        console.error('Failed to load hotels dataset:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [destination]);

  // Filtering & Sorting
  let filteredHotels = hotels.filter(h => {
    const price = h.price_per_night_inr || h.price_inr || 0;
    if (price > priceRange) return false;
    if ((h.hotel_stars || 3) < minStars) return false;
    if (searchName.trim() && !h.property_name.toLowerCase().includes(searchName.toLowerCase()) && !h.address.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (sortBy === 'price_high_low') {
    filteredHotels.sort((a, b) => (b.price_per_night_inr || 0) - (a.price_per_night_inr || 0));
  } else if (sortBy === 'price_low_high') {
    filteredHotels.sort((a, b) => (a.price_per_night_inr || 0) - (b.price_per_night_inr || 0));
  } else if (sortBy === 'popularity') {
    filteredHotels.sort((a, b) => (b.hotel_stars || 0) - (a.hotel_stars || 0));
  }

  // Sorted selected hotels by stay order
  const sortedSelectedHotels = [...selectedHotels].sort((a, b) => (a.stayOrder || 1) - (b.stayOrder || 1));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* Selected Hotels Sequence Banner */}
      {selectedHotels.length > 0 && (
        <div className="mb-8 bg-[#121619] text-white p-5 rounded-3xl shadow-xl border border-[#D4B15A]/30">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faHotel} className="text-[#D4B15A]" />
              <h3 className="font-bold text-white text-base font-display">
                Your Stay Sequence ({selectedHotels.length} Hotel{selectedHotels.length > 1 ? 's' : ''})
              </h3>
            </div>
            <span className="text-xs text-[#D4B15A] font-semibold">
              Total Stay Nights: {selectedHotels.reduce((sum, h) => sum + (h.nights || 1), 0)} Nights
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSelectedHotels.map((h, idx) => (
              <div key={h.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 text-xs relative flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-[#D4B15A] text-black font-extrabold text-[10px] px-2 py-0.5 rounded-md uppercase">
                      Stay #{idx + 1}
                    </span>
                    <button 
                      onClick={() => onToggleHotel(h)}
                      className="text-gray-400 hover:text-rose-400 text-sm cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>

                  <h4 className="font-bold text-white text-sm line-clamp-1">
                    {h.property_name || h.name}
                  </h4>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    ₹{(h.price_per_night_inr || h.price_inr || 0).toLocaleString()} / night
                  </p>
                </div>

                {/* Sequence Order, Nights & Rooms Selector */}
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faListOl} className="text-gray-400 text-[10px]" />
                    <select
                      value={h.stayOrder || idx + 1}
                      onChange={(e) => onUpdateHotelConfig(h.id, parseInt(e.target.value), h.nights || 1, h.rooms || 1)}
                      className="bg-white/10 text-white font-bold px-2 py-1 rounded-lg outline-none text-[11px] cursor-pointer"
                    >
                      {selectedHotels.map((_, i) => (
                        <option key={i + 1} value={i + 1} className="bg-[#121619] text-white">Order {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faMoon} className="text-[#D4B15A] text-[10px]" />
                    <select
                      value={h.nights || 1}
                      onChange={(e) => onUpdateHotelConfig(h.id, h.stayOrder || idx + 1, parseInt(e.target.value), h.rooms || 1)}
                      className="bg-white/10 text-white font-bold px-2 py-1 rounded-lg outline-none text-[11px] cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 7, 10].map(n => (
                        <option key={n} value={n} className="bg-[#121619] text-white">{n} Night{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faHotel} className="text-emerald-400 text-[10px]" />
                    <select
                      value={h.rooms || 1}
                      onChange={(e) => onUpdateHotelConfig(h.id, h.stayOrder || idx + 1, h.nights || 1, parseInt(e.target.value))}
                      className="bg-white/10 text-white font-bold px-2 py-1 rounded-lg outline-none text-[11px] cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5].map(r => (
                        <option key={r} value={r} className="bg-[#121619] text-white">{r} Room{r > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid with Left Filters & Right Cards */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Filters */}
        <aside className="w-full lg:w-72 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm shrink-0 sticky top-36 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-gray-900 text-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faFilter} className="text-[#D4B15A]" />
              Filters
            </h3>
            <button 
              onClick={() => { setSearchName(''); setPriceRange(16500); setMinStars(0); }}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 underline cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Search by name
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input 
                  type="text"
                  placeholder="Hotel or area..."
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#D4B15A]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Price per night
                </label>
                <span className="text-xs font-extrabold text-[#D4B15A]">
                  Max ₹{priceRange.toLocaleString()}
                </span>
              </div>
              <input 
                type="range"
                min="1500"
                max="16500"
                step="500"
                value={priceRange}
                onChange={e => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#D4B15A] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Star Rating
              </label>
              <div className="flex gap-2">
                {[3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setMinStars(minStars === star ? 0 : star)}
                    className={`flex-1 py-2 rounded-xl text-xs border font-bold transition-all ${
                      minStars === star
                        ? 'bg-[#121619] text-[#D4B15A] border-[#121619] shadow-md'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#D4B15A]'
                    }`}
                  >
                    {star} <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Right Main Content Stream */}
        <main className="flex-1">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900">
                {filteredHotels.length} Hotels Found {destination && `in ${destination}`}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Select one or more hotels to split your stay across locations.</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-[#D4B15A] cursor-pointer"
              >
                <option value="popularity">Popularity (Star Rating)</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="price_low_high">Price: Low to High</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4B15A]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredHotels.map(hotel => {
                const selectedItem = selectedHotels.find(h => h.id === hotel.id);
                const isSelected = !!selectedItem;
                return (
                  <div key={hotel.id} className={isSelected ? "ring-2 ring-[#D4B15A] rounded-2xl" : ""}>
                    <HotelCard 
                      hotel={hotel}
                      onSelect={(h) => onToggleHotel(h)}
                      selectLabel={isSelected ? `Selected (Stay #${selectedItem.stayOrder || 1}) ✓` : "+ Add Hotel Stay"}
                    />
                  </div>
                );
              })}

              {filteredHotels.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100">
                  <FontAwesomeIcon icon={faHotel} className="text-gray-300 text-5xl mb-3" />
                  <h4 className="text-lg font-bold text-gray-800">No hotels match your filters</h4>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your price slider or search query.</p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Nav */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={onBack}
              className="px-6 py-3 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </button>

            <button
              onClick={onNext}
              className="px-8 py-3 bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Ride & Transport ({selectedHotels.length})</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

        </main>

      </div>

    </div>
  );
}
