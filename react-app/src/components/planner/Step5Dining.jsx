import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUtensils, 
  faMugHot, 
  faStar, 
  faUsers, 
  faCheck, 
  faXmark, 
  faArrowRight, 
  faArrowLeft,
  faCommentDots,
  faCalendarDays,
  faClock,
  faLocationDot,
  faWandMagicSparkles
} from '@fortawesome/free-solid-svg-icons';

export default function Step5Dining({ 
  destination, 
  totalDays = 3,
  selectedDining = [], 
  onToggleDining, 
  onNext, 
  onBack,
  selectedPlaces = []
}) {
  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' | 'cafes'
  
  const [cafes, setCafes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchName, setSearchName] = useState('');
  const [maxCost, setMaxCost] = useState(5000);
  const [vegOnly, setVegOnly] = useState(false);

  // Modal
  const [activeReviewModal, setActiveReviewModal] = useState(null);

  const timeSlots = ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'];
  const daysList = Array.from({ length: totalDays }, (_, i) => `Day ${i + 1}`);

  useEffect(() => {
    const fetchDiningData = async () => {
      setLoading(true);
      try {
        const targetCity = (destination || '').toLowerCase().trim();

        // 1. Fetch Cafes
        const cafeRes = await fetch('/data/cafes.json');
        const cafeData = await cafeRes.json();
        let filteredCafes = Array.isArray(cafeData) ? cafeData.filter(c => c.city.toLowerCase().includes(targetCity) || targetCity.includes(c.city.toLowerCase())) : [];
        if (filteredCafes.length === 0) filteredCafes = (Array.isArray(cafeData) ? cafeData : []).slice(0, 30);
        setCafes(filteredCafes);

        // 2. Fetch Restaurants
        const restRes = await fetch('/data/restaurants.json');
        const restData = await restRes.json();
        let filteredRests = Array.isArray(restData) ? restData.filter(r => r.city.toLowerCase().includes(targetCity) || targetCity.includes(r.city.toLowerCase())) : [];
        if (filteredRests.length === 0) filteredRests = (Array.isArray(restData) ? restData : []).slice(0, 30);
        setRestaurants(filteredRests);

      } catch (err) {
        console.error("Failed to load dining dataset:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiningData();
  }, [destination]);

  // Find cafes near selected tourist spots
  const spotsNames = selectedPlaces.map(p => p.name.toLowerCase());
  const nearbyCafes = cafes.filter(c => 
    spotsNames.some(s => c.review.toLowerCase().includes(s) || c.name.toLowerCase().includes(s) || c.cuisine.toLowerCase().includes(s))
  );

  const renderStars = (rating) => {
    const count = Math.min(5, Math.max(1, Math.round(rating)));
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FontAwesomeIcon key={i} icon={faStar} className={i < count ? "text-[#D4B15A]" : "text-gray-300"} />
      );
    }
    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-[#D4B15A] uppercase tracking-widest bg-[#D4B15A]/10 px-3 py-1 rounded-full border border-[#D4B15A]/20">
            Step 5: Dining & Reservation Slots
          </span>
          <h2 className="text-3xl font-display font-bold text-gray-900 mt-2">
            Reserve Tables in Top Cafes & Restaurants
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Choose day and meal time slots for each cafe and restaurant.
          </p>
        </div>

        <button
          onClick={onNext}
          className="bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] font-bold px-8 py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center gap-2"
        >
          <span>Next: Review Trip ({selectedCafes.length + selectedRestaurants.length})</span>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      {/* Suggested Cafes near Selected Tourist Spots Banner */}
      {selectedPlaces.length > 0 && nearbyCafes.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-[#D4B15A]/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[#D4B15A]" />
            <span className="font-bold text-gray-900">Recommended Cafes near your selected spots:</span>
            <span className="text-gray-600">
              {nearbyCafes.slice(0, 3).map(c => c.name).join(', ')}
            </span>
          </div>
          <button 
            onClick={() => setActiveTab('cafes')}
            className="text-[11px] font-bold text-[#D4B15A] underline cursor-pointer"
          >
            View Suggested Cafes
          </button>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm max-w-md mb-8">
        <button
          onClick={() => setActiveTab('cafes')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'cafes'
              ? 'bg-[#121619] text-[#D4B15A] shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FontAwesomeIcon icon={faMugHot} />
          Cafes ({selectedCafes.length})
        </button>

        <button
          onClick={() => setActiveTab('restaurants')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'restaurants'
              ? 'bg-[#121619] text-[#D4B15A] shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FontAwesomeIcon icon={faUtensils} />
          Restaurants ({selectedRestaurants.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4B15A]"></div>
        </div>
      ) : activeTab === 'cafes' ? (
        
        /* Cafes List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafes.map(cafe => {
            const cafeBookings = selectedCafes.filter(c => c.id === cafe.id || (c.bookingId && c.bookingId.startsWith(`c_${cafe.id}_`)));
            const isSelected = cafeBookings.length > 0;
            return (
              <div 
                key={cafe.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'border-[#D4B15A] ring-2 ring-[#D4B15A]/30 shadow-lg' 
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#D4B15A] bg-[#D4B15A]/10 px-2.5 py-0.5 rounded-md">
                      Cafe {cafeBookings.length > 1 ? `(${cafeBookings.length} Slots)` : ''}
                    </span>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-lg text-xs">
                      {renderStars(cafe.overall_rating)}
                      <span className="font-bold text-gray-700 ml-1">{cafe.overall_rating}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{cafe.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">📍 {cafe.city} • <strong>Cuisine:</strong> {cafe.cuisine}</p>

                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-3 flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Rate for two:</span>
                    <span className="font-extrabold text-gray-900">₹{cafe.rate_for_two.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  {/* Review snippet button */}
                  {cafe.review && (
                    <button
                      onClick={() => setActiveReviewModal(cafe)}
                      className="w-full mb-3 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faCommentDots} className="text-[#D4B15A]" />
                      Read Review
                    </button>
                  )}

                  {/* Reservations List when Selected */}
                  {isSelected ? (
                    <div className="space-y-3 mb-3">
                      {cafeBookings.map((b, bIdx) => (
                        <div key={b.bookingId || b.id || bIdx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs relative">
                          <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                            <span className="text-[10px] font-extrabold text-[#D4B15A] uppercase">
                              Slot #{bIdx + 1}
                            </span>
                            <button
                              onClick={() => onRemoveCafeReservation(b.bookingId || b.id)}
                              className="text-gray-400 hover:text-rose-500 text-xs cursor-pointer"
                              title="Cancel this slot"
                            >
                              <FontAwesomeIcon icon={faXmark} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                              <FontAwesomeIcon icon={faCalendarDays} className="text-[#D4B15A]" /> Day
                            </span>
                            <select
                              value={b.day || 'Day 1'}
                              onChange={(e) => onUpdateCafeConfig(b.bookingId || b.id, b.seats || travellers, e.target.value, b.timeSlot || 'Lunch')}
                              className="bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-gray-800 outline-none cursor-pointer text-xs"
                            >
                              {daysList.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                              <FontAwesomeIcon icon={faClock} className="text-[#D4B15A]" /> Time
                            </span>
                            <select
                              value={b.timeSlot || 'Lunch'}
                              onChange={(e) => onUpdateCafeConfig(b.bookingId || b.id, b.seats || travellers, b.day || 'Day 1', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-gray-800 outline-none cursor-pointer text-xs"
                            >
                              {timeSlots.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                              <FontAwesomeIcon icon={faUsers} className="text-[#D4B15A]" /> Guests
                            </span>
                            <select
                              value={b.seats || travellers}
                              onChange={(e) => onUpdateCafeConfig(b.bookingId || b.id, parseInt(e.target.value), b.day || 'Day 1', b.timeSlot || 'Lunch')}
                              className="bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-gray-800 outline-none cursor-pointer text-xs"
                            >
                              {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                                <option key={num} value={num}>{num} Guests</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}

                      {/* Add Another Slot Button */}
                      <button
                        onClick={() => onAddCafeReservation(cafe, `Day ${Math.min(totalDays, cafeBookings.length + 1)}`, 'Evening Snacks')}
                        className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-[#D4B15A] font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer border border-[#D4B15A]/30 flex items-center justify-center gap-1"
                      >
                        + Book Another Slot at {cafe.name}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAddCafeReservation(cafe, 'Day 1', 'Lunch')}
                      className="w-full bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      + Reserve Table
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* Restaurants List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(rest => {
            const restBookings = selectedRestaurants.filter(r => r.id === rest.id || (r.bookingId && r.bookingId.startsWith(`r_${rest.id}_`)));
            const isSelected = restBookings.length > 0;
            return (
              <div 
                key={rest.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'border-[#D4B15A] ring-2 ring-[#D4B15A]/30 shadow-lg' 
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#D4B15A] bg-[#D4B15A]/10 px-2.5 py-0.5 rounded-md">
                      Restaurant {restBookings.length > 1 ? `(${restBookings.length} Slots)` : ''}
                    </span>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-lg text-xs">
                      {renderStars(rest.avg_rating)}
                      <span className="font-bold text-gray-700 ml-1">{rest.avg_rating}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{rest.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">📍 {rest.area}, {rest.city}</p>
                  <p className="text-xs text-gray-600 line-clamp-1 mb-3"><strong>Food Type:</strong> {rest.food_type}</p>

                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-4 flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Price for two:</span>
                    <span className="font-extrabold text-gray-900">₹{rest.price.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  {/* Reservations List when Selected */}
                  {isSelected ? (
                    <div className="space-y-3 mb-3">
                      {restBookings.map((b, bIdx) => (
                        <div key={b.bookingId || b.id || bIdx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs relative">
                          <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                            <span className="text-[10px] font-extrabold text-[#D4B15A] uppercase">
                              Slot #{bIdx + 1}
                            </span>
                            <button
                              onClick={() => onRemoveRestaurantReservation(b.bookingId || b.id)}
                              className="text-gray-400 hover:text-rose-500 text-xs cursor-pointer"
                              title="Cancel this slot"
                            >
                              <FontAwesomeIcon icon={faXmark} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                              <FontAwesomeIcon icon={faCalendarDays} className="text-[#D4B15A]" /> Day
                            </span>
                            <select
                              value={b.day || 'Day 1'}
                              onChange={(e) => onUpdateRestaurantConfig(b.bookingId || b.id, b.seats || travellers, e.target.value, b.timeSlot || 'Dinner')}
                              className="bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-gray-800 outline-none cursor-pointer text-xs"
                            >
                              {daysList.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                              <FontAwesomeIcon icon={faClock} className="text-[#D4B15A]" /> Time
                            </span>
                            <select
                              value={b.timeSlot || 'Dinner'}
                              onChange={(e) => onUpdateRestaurantConfig(b.bookingId || b.id, b.seats || travellers, b.day || 'Day 1', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-gray-800 outline-none cursor-pointer text-xs"
                            >
                              {timeSlots.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                              <FontAwesomeIcon icon={faUsers} className="text-[#D4B15A]" /> Guests
                            </span>
                            <select
                              value={b.seats || travellers}
                              onChange={(e) => onUpdateRestaurantConfig(b.bookingId || b.id, parseInt(e.target.value), b.day || 'Day 1', b.timeSlot || 'Dinner')}
                              className="bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-gray-800 outline-none cursor-pointer text-xs"
                            >
                              {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                                <option key={num} value={num}>{num} Guests</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}

                      {/* Add Another Slot Button */}
                      <button
                        onClick={() => onAddRestaurantReservation(rest, `Day ${Math.min(totalDays, restBookings.length + 1)}`, 'Dinner')}
                        className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-[#D4B15A] font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer border border-[#D4B15A]/30 flex items-center justify-center gap-1"
                      >
                        + Book Another Slot at {rest.name}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAddRestaurantReservation(rest, 'Day 1', 'Dinner')}
                      className="w-full bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      + Book Table
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      )}

      {/* Review Modal for Cafe */}
      {activeReviewModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{activeReviewModal.name}</h3>
                <p className="text-xs text-gray-400">Customer Review Snippet</p>
              </div>
              <button 
                onClick={() => setActiveReviewModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
              "{activeReviewModal.review}"
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveReviewModal(null)}
                className="px-5 py-2 bg-[#121619] text-[#D4B15A] font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
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
          <span>Review Complete Customization</span>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

    </div>
  );
}
