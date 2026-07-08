import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faStar, faCheckCircle, faLocationDot, faArrowRight, faCoins, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../stores/useAppStore';

export default function SelectHotel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useAppStore();

  const dest = searchParams.get('to')?.toLowerCase() || 'delhi';
  const type = searchParams.get('type') || 'flight'; // flight | bus | hotels
  const passengers = parseInt(searchParams.get('passengers')) || 1;

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [priceRange, setPriceRange] = useState(15000);
  const [minStars, setMinStars] = useState(0);
  const [fssaiOnly, setFssaiOnly] = useState(false);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const res = await fetch('/src/data/hotels.json');
        const data = await res.json();
        
        // Filter by destination city
        const filteredHotels = data.filter(h => h.city.toLowerCase() === dest);
        setHotels(filteredHotels);
      } catch (err) {
        console.error('Failed to load hotels', err);
        addToast({ type: 'error', message: 'Could not load hotel inventory' });
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [dest]);

  // Apply UI Filters
  const filtered = hotels.filter(hotel => {
    const price = hotel.price_per_night_inr || hotel.price_inr || 0;
    if (price > priceRange) return false;
    if (hotel.star_category < minStars) return false;
    if (fssaiOnly && !hotel.fssai_certified) return false;
    return true;
  });

  const handleSelectHotel = (hotel) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('hotelId', hotel.hotel_id);
    newParams.set('hotelName', hotel.name);
    newParams.set('hotelPrice', hotel.price_per_night_inr || hotel.price_inr || 0);

    addToast({ 
      type: 'success', 
      title: 'Hotel Selected!', 
      message: `Selected ${hotel.name}. Now proceeding to book transport.` 
    });

    if (type === 'hotels') {
      // If user only searched for hotels, go straight to checkout in booking-grid
      navigate(`/booking-grid?${newParams.toString()}`);
    } else {
      // Otherwise, proceed to flights/buses results
      navigate(`/booking-grid?${newParams.toString()}`);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50 flex flex-col md:flex-row pb-12">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-200 p-6 md:sticky md:top-16 md:h-[calc(100vh-4rem)] overflow-y-auto shrink-0">
        <div className="flex items-center gap-2 text-gray-900 font-display font-bold text-lg mb-6">
          <FontAwesomeIcon icon={faFilter} className="text-[#D4B15A]" />
          Filters
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Max Price: ₹{priceRange.toLocaleString()} / night
            </label>
            <input 
              type="range" 
              min="1000" 
              max="25000" 
              step="500"
              value={priceRange}
              onChange={e => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#D4B15A]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Star Rating</label>
            <div className="flex gap-2">
              {[3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setMinStars(minStars === star ? 0 : star)}
                  className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${
                    minStars === star 
                      ? 'bg-[#121619] text-[#D4B15A] border-[#121619]' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4B15A]'
                  }`}
                >
                  {star} <FontAwesomeIcon icon={faStar} className="text-xs" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Certification</label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={fssaiOnly}
                onChange={e => setFssaiOnly(e.target.checked)}
                className="w-4 h-4 text-[#D4B15A] border-gray-300 rounded focus:ring-[#D4B15A]"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                FSSAI Certified Only
              </span>
            </label>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-8">
          <span className="text-xs font-bold text-[#D4B15A] uppercase tracking-widest bg-[#D4B15A]/10 px-3 py-1 rounded-full border border-[#D4B15A]/20">
            Step 2: Accommodations
          </span>
          <h1 className="text-3xl font-display font-bold text-[#121619] capitalize mt-3">
            Available Hotels in {dest}
          </h1>
          <p className="text-gray-500 mt-2">Pick your stay before choosing transport details.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4B15A]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filtered.map((hotel) => (
              <div key={hotel.hotel_id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col sm:flex-row gap-6 group">
                {/* Image panel */}
                <div className="sm:w-48 h-48 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                  {hotel.images && hotel.images[0] ? (
                    <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  {hotel.star_category && (
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[#D4B15A] text-xs font-bold">
                      {hotel.star_category} <FontAwesomeIcon icon={faStar} />
                    </div>
                  )}
                </div>

                {/* Content details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-bold text-[#121619] leading-tight">
                        {hotel.name}
                      </h3>
                      {hotel.fssai_certified && (
                        <span title="FSSAI Certified Food" className="text-green-500 text-lg">
                          <FontAwesomeIcon icon={faCheckCircle} />
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-500 text-sm mt-1 mb-2 line-clamp-1">📍 {hotel.address}</p>
                    
                    {/* Attractions */}
                    {hotel.nearby_attractions_km && (
                      <div className="text-[11px] text-gray-400 mt-2 mb-3">
                        <span className="font-semibold text-gray-500">Nearby attractions:</span>{' '}
                        {Object.entries(hotel.nearby_attractions_km).map(([name, dist]) => (
                          <span key={name} className="mr-2">
                            {name} ({dist}km)
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Amenities Badges */}
                    {hotel.amenities && (
                      <div className="flex flex-wrap gap-1">
                        {hotel.amenities.slice(0, 4).map(am => (
                          <span key={am} className="text-[9px] uppercase tracking-wider font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                            {am}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Per Night</p>
                      <p className="text-2xl font-bold text-[#121619]">
                        ₹{hotel.price_per_night_inr?.toLocaleString() || hotel.price_inr?.toLocaleString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleSelectHotel(hotel)} 
                      className="bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 text-sm"
                    >
                      Book Hotel
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="text-gray-300 text-6xl mb-4">
                  <FontAwesomeIcon icon={faFilter} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No hotels found</h3>
                <p className="text-gray-500">Try adjusting your filters or destination criteria.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
