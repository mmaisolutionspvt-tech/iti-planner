import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWandMagicSparkles, 
  faMapLocationDot, 
  faCalendarAlt, 
  faCarSide, 
  faWallet, 
  faUsers,
  faSliders,
  faArrowRight,
  faRotateLeft,
  faSpinner,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { generateTripPlan } from '../services/gemini';
import { searchPlaces } from '../services/places';
import useAppStore from '../stores/useAppStore';
import TripOutput from '../components/planner/TripOutput';
import DraftHistory from '../components/planner/DraftHistory';

import CustomizationHeader from '../components/planner/CustomizationHeader';
import Step1Places from '../components/planner/Step1Places';
import Step2SchedulePlaces from '../components/planner/Step2SchedulePlaces';
import Step3Hotels from '../components/planner/Step3Hotels';
import Step4Rides from '../components/planner/Step4Rides';
import Step5Dining from '../components/planner/Step5Dining';
import StepTransport from '../components/planner/StepTransport';
import Step6Review from '../components/planner/Step6Review';
import LiveRouteModal from '../components/planner/LiveRouteModal';

export default function ScheduleTrip() {
  const [params, setParams] = useState({ 
    fromCity: 'Delhi',
    locations: '', 
    fromDate: '', 
    toDate: '', 
    mode: 'Bus / Coach', 
    budget: 'balanced',
    travellers: 2,
    tripType: 'Family Trip'
  });

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [showLiveRoute, setShowLiveRoute] = useState(false);
  const { addToast, addDraft } = useAppStore();

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [searchingFrom, setSearchingFrom] = useState(false);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [searchingDest, setSearchingDest] = useState(false);

  useEffect(() => {
    if (!params.fromCity.trim() || params.fromCity.trim().length < 2) {
      setFromSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingFrom(true);
      try {
        const results = await searchPlaces(params.fromCity);
        setFromSuggestions(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingFrom(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [params.fromCity]);

  useEffect(() => {
    if (!params.locations.trim() || params.locations.trim().length < 2) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingDest(true);
      try {
        const results = await searchPlaces(params.locations);
        setDestSuggestions(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingDest(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [params.locations]);

  // Navigation Pages: 'input' | 'modeChoice' | 'wizard' | 'result'
  const [pageState, setPageState] = useState('input');
  
  // Customization Wizard Step (1..7)
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard State
  const [wizardData, setWizardData] = useState({
    selectedPlaces: [],
    scheduleData: {}, // { [placeId]: { day: 'Day 1', timeSlot: 'Morning' } }
    selectedHotels: [], // [ { ...hotel, stayOrder: 1, nights: 1 } ]
    selectedRides: [],  // [ { ...ride } ]
    selectedCafes: [],       // [ { ...cafe, seats: 2, day: 'Day 1', timeSlot: 'Lunch' } ]
    selectedRestaurants: [], // [ { ...rest, seats: 2, day: 'Day 1', timeSlot: 'Dinner' } ]
    outboundTransport: null, // Outbound flight/bus
    returnTransport: null    // Return flight/bus
  });

  // Calculate Days count between fromDate and toDate
  const calculateTotalDays = () => {
    if (!params.fromDate || !params.toDate) return 3;
    const f = new Date(params.fromDate);
    const t = new Date(params.toDate);
    const diff = Math.ceil(Math.abs(t - f) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 3;
  };

  // Cumulative Total Cost Tracker
  const calculateTotalCost = () => {
    let total = 0;

    // Outbound & Return Tickets (price * travellers)
    if (wizardData.outboundTransport) {
      total += (wizardData.outboundTransport.price || 0) * params.travellers;
    }
    if (wizardData.returnTransport) {
      total += (wizardData.returnTransport.price || 0) * params.travellers;
    }

    // Entrance fees (fee * travellers)
    wizardData.selectedPlaces.forEach(p => {
      total += (p.entrance_fee_inr || 0) * params.travellers;
    });

    // Multi-Hotels Cost (price * nights * rooms)
    wizardData.selectedHotels.forEach(h => {
      const hPrice = h.price_per_night_inr || h.price_inr || 0;
      total += hPrice * (h.nights || 1) * (h.rooms || 1);
    });

    // Multi-Rides Cost
    wizardData.selectedRides.forEach(r => {
      total += r.price || 0;
    });

    // Cafes (rate_for_two * ceil(seats / 2))
    wizardData.selectedCafes.forEach(c => {
      total += (c.rate_for_two || 500) * Math.ceil((c.seats || 2) / 2);
    });

    // Restaurants (price * ceil(seats / 2))
    wizardData.selectedRestaurants.forEach(r => {
      total += (r.price || 400) * Math.ceil((r.seats || 2) / 2);
    });

    return total;
  };

  // Form Submit on Page 1
  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!params.locations.trim()) {
      addToast({ type: 'error', message: 'Please enter a destination city.' });
      return;
    }
    setPageState('modeChoice');
  };

  // Auto-Plan Generator Trigger
  const handleAutoPlan = async () => {
    setLoading(true);
    setPlan(null);
    setApiError(null);
    try {
      const locList = params.locations.split(',').map(s => s.trim()).filter(Boolean);
      const generated = await generateTripPlan({
        locations: locList,
        fromDate: params.fromDate,
        toDate: params.toDate,
        mode: params.mode,
        budget: params.budget,
        fromCity: params.fromCity || 'Delhi',
        travellerCount: params.travellers,
        tripType: params.tripType
      });

      if (generated.error) {
        setApiError(generated.error);
        addToast({ type: 'error', message: generated.error });
      } else {
        setPlan(generated);
        setPageState('result');
        addDraft({ params, plan: generated, date: new Date().toISOString() });
        addToast({ type: 'success', title: 'Auto-Plan Ready!', message: 'AI generated your itinerary.' });
      }
    } catch (err) {
      setApiError(err.message);
      addToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Trigger Custom Itinerary Generation
  const handleCustomPlanGenerate = async () => {
    setLoading(true);
    setPlan(null);
    setApiError(null);
    try {
      const locList = params.locations.split(',').map(s => s.trim()).filter(Boolean);
      const generated = await generateTripPlan({
        locations: locList,
        fromDate: params.fromDate,
        toDate: params.toDate,
        mode: params.mode,
        budget: params.budget,
        fromCity: params.fromCity || 'Delhi',
        travellerCount: params.travellers,
        tripType: params.tripType,
        selectedHotels: wizardData.selectedHotels,
        customPlaces: wizardData.selectedPlaces,
        scheduleData: wizardData.scheduleData,
        selectedRides: wizardData.selectedRides,
        selectedCafes: wizardData.selectedCafes,
        selectedRestaurants: wizardData.selectedRestaurants,
        outboundTransport: wizardData.outboundTransport,
        returnTransport: wizardData.returnTransport
      });

      if (generated.error) {
        setApiError(generated.error);
        addToast({ type: 'error', message: generated.error });
      } else {
        setPlan(generated);
        setPageState('result');
        addDraft({ params, plan: generated, date: new Date().toISOString() });
        addToast({ type: 'success', title: 'Customized Itinerary Ready!', message: 'Your tailored trip plan has been generated.' });
      }
    } catch (err) {
      setApiError(err.message);
      addToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // State Updaters for Wizard Data
  const togglePlace = (place) => {
    setWizardData(prev => {
      const exists = prev.selectedPlaces.some(p => p.id === place.id);
      let updatedPlaces;
      if (exists) {
        updatedPlaces = prev.selectedPlaces.filter(p => p.id !== place.id);
      } else {
        updatedPlaces = [...prev.selectedPlaces, place];
      }
      return { ...prev, selectedPlaces: updatedPlaces };
    });
  };

  const updateSchedule = (placeId, day, timeSlot) => {
    setWizardData(prev => ({
      ...prev,
      scheduleData: {
        ...prev.scheduleData,
        [placeId]: { day, timeSlot }
      }
    }));
  };

  const toggleHotel = (hotel) => {
    setWizardData(prev => {
      const exists = prev.selectedHotels.some(h => h.id === hotel.id);
      let updated;
      if (exists) {
        updated = prev.selectedHotels.filter(h => h.id !== hotel.id);
      } else {
        const nextOrder = prev.selectedHotels.length + 1;
        updated = [...prev.selectedHotels, { ...hotel, stayOrder: nextOrder, nights: 1, rooms: 1 }];
      }
      return { ...prev, selectedHotels: updated };
    });
  };

  const updateHotelConfig = (hotelId, stayOrder, nights, rooms = 1) => {
    setWizardData(prev => ({
      ...prev,
      selectedHotels: prev.selectedHotels.map(h => h.id === hotelId ? { ...h, stayOrder, nights, rooms } : h)
    }));
  };

  const toggleRide = (ride) => {
    setWizardData(prev => {
      const exists = prev.selectedRides.some(r => r.ride_id === ride.ride_id);
      let updated;
      if (exists) {
        updated = prev.selectedRides.filter(r => r.ride_id !== ride.ride_id);
      } else {
        updated = [...prev.selectedRides, ride];
      }
      return { ...prev, selectedRides: updated };
    });
  };

  // Multi-reservation Cafe Handlers
  const addCafeReservation = (cafe, day = 'Day 1', timeSlot = 'Lunch') => {
    setWizardData(prev => {
      const bookingId = `c_${cafe.id}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const newEntry = { ...cafe, bookingId, seats: params.travellers || 2, day, timeSlot };
      return { ...prev, selectedCafes: [...prev.selectedCafes, newEntry] };
    });
  };

  const removeCafeReservation = (bookingId) => {
    setWizardData(prev => ({
      ...prev,
      selectedCafes: prev.selectedCafes.filter(c => c.bookingId !== bookingId && c.id !== bookingId)
    }));
  };

  const updateCafeConfig = (bookingId, seats, day, timeSlot) => {
    setWizardData(prev => ({
      ...prev,
      selectedCafes: prev.selectedCafes.map(c => (c.bookingId === bookingId || c.id === bookingId) ? { ...c, seats, day, timeSlot } : c)
    }));
  };

  // Multi-reservation Restaurant Handlers
  const addRestaurantReservation = (rest, day = 'Day 1', timeSlot = 'Dinner') => {
    setWizardData(prev => {
      const bookingId = `r_${rest.id}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const newEntry = { ...rest, bookingId, seats: params.travellers || 2, day, timeSlot };
      return { ...prev, selectedRestaurants: [...prev.selectedRestaurants, newEntry] };
    });
  };

  const removeRestaurantReservation = (bookingId) => {
    setWizardData(prev => ({
      ...prev,
      selectedRestaurants: prev.selectedRestaurants.filter(r => r.bookingId !== bookingId && r.id !== bookingId)
    }));
  };

  const updateRestaurantConfig = (bookingId, seats, day, timeSlot) => {
    setWizardData(prev => ({
      ...prev,
      selectedRestaurants: prev.selectedRestaurants.map(r => (r.bookingId === bookingId || r.id === bookingId) ? { ...r, seats, day, timeSlot } : r)
    }));
  };

  const selectOutboundTransport = (item) => {
    setWizardData(prev => ({ ...prev, outboundTransport: item }));
  };

  const selectReturnTransport = (item) => {
    setWizardData(prev => ({ ...prev, returnTransport: item }));
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 pb-20">
      
      {/* Sticky Customization Header (Visible inside Wizard mode) */}
      {pageState === 'wizard' && (
        <CustomizationHeader
          currentStep={wizardStep}
          setStep={(s) => setWizardStep(s)}
          wizardData={wizardData}
          calculateTotalCost={calculateTotalCost}
        />
      )}

      {/* Floating Live Route Button for Car/Bike */}
      {(pageState === 'wizard' || pageState === 'modeChoice') && 
       (params.mode.includes('Car') || params.mode.includes('Bike')) && (
        <button
          onClick={() => setShowLiveRoute(true)}
          className="fixed right-4 top-32 z-50 bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-full pl-4 pr-5 py-3 font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105"
        >
          <div className="w-8 h-8 rounded-full bg-[#D4B15A] text-[#121619] flex items-center justify-center text-lg">
            <FontAwesomeIcon icon={faMapLocationDot} />
          </div>
          Live Route 🗺️
        </button>
      )}

      <LiveRouteModal 
        isOpen={showLiveRoute} 
        onClose={() => setShowLiveRoute(false)} 
        fromCity={params.fromCity} 
        destinations={params.locations} 
      />

      <div className="max-w-7xl mx-auto px-4 mt-6">

        {/* PAGE 1: INPUT FORM */}
        {pageState === 'input' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl max-w-4xl mx-auto mb-10 border border-gray-100"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-[#121619] to-[#1e2429] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#D4B15A] text-2xl shadow-lg">
                <FontAwesomeIcon icon={faWandMagicSparkles} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 font-display">AI Trip Planner</h2>
              <p className="text-gray-500 mt-2">Plan your custom itinerary in 60 seconds.</p>
            </div>

            <form onSubmit={handleInputSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">From Location (Origin City)</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faMapLocationDot} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi, Mumbai, Bangalore, Jaipur"
                    value={params.fromCity}
                    onChange={e => setParams({...params, fromCity: e.target.value})}
                    className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 focus:border-[#121619] outline-none text-sm font-medium"
                  />
                  {searchingFrom && (
                    <FontAwesomeIcon icon={faSpinner} spin className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4B15A]" />
                  )}
                </div>
                {fromSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-56 overflow-y-auto">
                    {fromSuggestions.map((item, i) => (
                      <button
                        type="button"
                        key={item.placeId || i}
                        onClick={() => {
                          setParams({...params, fromCity: item.displayName || item.text});
                          setFromSuggestions([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b border-gray-50 last:border-none flex items-center justify-between transition-colors text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faLocationDot} className="text-[#D4B15A] shrink-0" />
                          <span className="font-semibold text-gray-800 truncate">{item.text || item.displayName}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Destination City / Cities</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faMapLocationDot} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4B15A]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai, Jaipur, Manali, Goa"
                    value={params.locations}
                    onChange={e => setParams({...params, locations: e.target.value})}
                    className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 focus:border-[#121619] focus:ring-1 focus:ring-[#121619] outline-none transition-all text-sm font-medium"
                  />
                  {searchingDest && (
                    <FontAwesomeIcon icon={faSpinner} spin className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4B15A]" />
                  )}
                </div>
                {destSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-56 overflow-y-auto">
                    {destSuggestions.map((item, i) => (
                      <button
                        type="button"
                        key={item.placeId || i}
                        onClick={() => {
                          setParams({...params, locations: item.displayName || item.text});
                          setDestSuggestions([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b border-gray-50 last:border-none flex items-center justify-between transition-colors text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faLocationDot} className="text-[#D4B15A] shrink-0" />
                          <span className="font-semibold text-gray-800 truncate">{item.text || item.displayName}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={params.fromDate}
                    onChange={e => setParams({...params, fromDate: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={params.toDate}
                    onChange={e => setParams({...params, toDate: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Mode</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faCarSide} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] outline-none text-sm font-medium appearance-none" 
                    value={params.mode} 
                    onChange={e => setParams({...params, mode: e.target.value})}
                  >
                    <option value="Bus / Coach">Bus / Coach</option>
                    <option value="Flight">Flight</option>
                    <option value="Train">Train</option>
                    <option value="Personal/Rental Car">Personal/Rental Car</option>
                    <option value="Bike / Personal Vehicle">Bike / Personal Vehicle 🏍️</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Category / Vibe</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faUsers} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4B15A]" />
                  <select 
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] outline-none text-sm font-medium appearance-none" 
                    value={params.tripType} 
                    onChange={e => setParams({...params, tripType: e.target.value})}
                  >
                    <option value="Family Trip">👨‍👩‍👧‍👦 Family Trip</option>
                    <option value="Friends Trip">🧑‍🤝‍🧑 Friends Trip</option>
                    <option value="Couples / Romantic Trip">❤️ Couples / Romantic Trip</option>
                    <option value="Solo Trip">🎒 Solo Trip</option>
                    <option value="Corporate / Business Trip">💼 Corporate / Business Trip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Travellers</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faUsers} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={params.travellers}
                    onChange={e => setParams({...params, travellers: parseInt(e.target.value) || 1})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="md:col-span-2 mt-4">
                <button 
                  type="submit" 
                  className="w-full bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Planning Options</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {/* PAGE 2: MODE CHOICE (AUTO VS CUSTOMIZE) */}
        {pageState === 'modeChoice' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto py-10"
          >
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#D4B15A] uppercase tracking-widest bg-[#D4B15A]/10 px-3 py-1 rounded-full border border-[#D4B15A]/20">
                Choose Planning Experience
              </span>
              <h2 className="text-3xl font-display font-bold text-gray-900 mt-3">
                How would you like to build your trip to {params.locations}?
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Select automatic generation or customize tourist spots, hotels, rides, and dining step-by-step.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Option 1: AI Auto Plan */}
              <div 
                onClick={handleAutoPlan}
                className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-[#D4B15A] shadow-md hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#D4B15A] text-2xl mb-6 group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faWandMagicSparkles} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#D4B15A] transition-colors mb-2">
                    Let AI Auto-Plan for You ✨
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-6">
                    Our AI instantly generates a complete day-by-day itinerary with sightseeing, accommodation, and travel tips based on your budget tier.
                  </p>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? 'Generating...' : 'Generate Auto-Itinerary ✨'}
                </button>
              </div>

              {/* Option 2: Customize Your Trip */}
              <div 
                onClick={() => {
                  setPageState('wizard');
                  setWizardStep(1);
                }}
                className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-[#D4B15A] shadow-md hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-2xl mb-6 group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faSliders} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                    Customize Your Trip 🎨
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-6">
                    Handpick popular tourist hubs, schedule visit times, pick your hotel, book private ground rides, and reserve dining table seats step-by-step.
                  </p>
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2">
                  <span>Start Step-by-Step Customization 🎨</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>

            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setPageState('input')}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline cursor-pointer"
              >
                ← Back to Input Form
              </button>
            </div>
          </motion.div>
        )}

        {/* PAGE 3: CUSTOMIZATION WIZARD STEPS */}
        {pageState === 'wizard' && (
          <div className="py-6">
            
            {wizardStep === 1 && (
              <Step1Places
                destination={params.locations}
                selectedPlaces={wizardData.selectedPlaces}
                onTogglePlace={togglePlace}
                tripType={params.tripType}
                onNext={() => setWizardStep(2)}
              />
            )}

            {wizardStep === 2 && (
              <StepTransport
                fromCity={params.fromCity}
                destination={params.locations}
                fromDate={params.fromDate}
                toDate={params.toDate}
                outboundTransport={wizardData.outboundTransport}
                returnTransport={wizardData.returnTransport}
                onSelectOutbound={selectOutboundTransport}
                onSelectReturn={selectReturnTransport}
                travellers={params.travellers}
                onNext={() => setWizardStep(3)}
                onBack={() => setWizardStep(1)}
              />
            )}

            {wizardStep === 3 && (
              <Step2SchedulePlaces
                selectedPlaces={wizardData.selectedPlaces}
                scheduleData={wizardData.scheduleData}
                onUpdateSchedule={updateSchedule}
                totalDays={calculateTotalDays()}
                outboundTransport={wizardData.outboundTransport}
                returnTransport={wizardData.returnTransport}
                onNext={() => setWizardStep(4)}
                onBack={() => setWizardStep(2)}
              />
            )}

            {wizardStep === 4 && (
              <Step3Hotels
                destination={params.locations}
                selectedHotels={wizardData.selectedHotels}
                onToggleHotel={toggleHotel}
                onUpdateHotelConfig={updateHotelConfig}
                onNext={() => setWizardStep(5)}
                onBack={() => setWizardStep(3)}
              />
            )}

            {wizardStep === 5 && (
              <Step4Rides
                destination={params.locations}
                selectedRides={wizardData.selectedRides}
                onToggleRide={toggleRide}
                onNext={() => setWizardStep(6)}
                onBack={() => setWizardStep(4)}
              />
            )}

            {wizardStep === 6 && (
              <Step5Dining
                destination={params.locations}
                selectedPlaces={wizardData.selectedPlaces}
                selectedCafes={wizardData.selectedCafes}
                onAddCafeReservation={addCafeReservation}
                onRemoveCafeReservation={removeCafeReservation}
                onUpdateCafeConfig={updateCafeConfig}
                selectedRestaurants={wizardData.selectedRestaurants}
                onAddRestaurantReservation={addRestaurantReservation}
                onRemoveRestaurantReservation={removeRestaurantReservation}
                onUpdateRestaurantConfig={updateRestaurantConfig}
                totalDays={calculateTotalDays()}
                travellers={params.travellers}
                onNext={() => setWizardStep(7)}
                onBack={() => setWizardStep(5)}
              />
            )}

            {wizardStep === 7 && (
              <Step6Review
                wizardData={wizardData}
                scheduleData={wizardData.scheduleData}
                calculateTotalCost={calculateTotalCost}
                onJumpToStep={(stepNum) => setWizardStep(stepNum)}
                onConfirmGenerate={handleCustomPlanGenerate}
                loading={loading}
                travellers={params.travellers}
              />
            )}

          </div>
        )}

        {/* RESULT PAGE: GENERATED ITINERARY */}
        {pageState === 'result' && plan && (
          <AnimatePresence mode="wait">
            <motion.div
              key="planResult"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto no-print">
                <h3 className="text-2xl font-bold text-gray-900 font-display">Your Customized AI Itinerary</h3>
                <button 
                  onClick={() => setPageState('input')} 
                  className="text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faRotateLeft} />
                  Start New Customization
                </button>
              </div>

              <TripOutput 
                plan={plan} 
                setPlan={setPlan} 
                params={params} 
                selectedHotel={wizardData.selectedHotel} 
              />
            </motion.div>
          </AnimatePresence>
        )}

        {pageState !== 'wizard' && !plan && (
          <DraftHistory 
            onSelectDraft={(draft) => { 
              setParams(draft.params); 
              setPlan(draft.plan); 
              setPageState('result');
            }} 
          />
        )}

      </div>
    </div>
  );
}
