import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLandmark, 
  faHotel, 
  faCarSide, 
  faUtensils, 
  faPlane,
  faWandMagicSparkles, 
  faEdit, 
  faArrowLeft, 
  faWallet,
  faCamera,
  faCalendarCheck,
  faMoon,
  faListOl
} from '@fortawesome/free-solid-svg-icons';

import RouteMapPanel from './RouteMapPanel';

export default function Step6Review({ 
  wizardData, 
  scheduleData, 
  calculateTotalCost, 
  onJumpToStep, 
  onConfirmGenerate, 
  loading,
  travellers = 2
}) {
  const totalCost = calculateTotalCost();
  const selectedHotels = wizardData.selectedHotels || [];
  const selectedRides = wizardData.selectedRides || [];
  const sortedHotels = [...selectedHotels].sort((a, b) => (a.stayOrder || 1) - (b.stayOrder || 1));

  const outboundPrice = wizardData.outboundTransport?.price || 4000;
  const returnPrice = wizardData.returnTransport?.price || 4000;

  const outboundTotal = outboundPrice * travellers;
  const returnTotal = returnPrice * travellers;
  const spotsTotal = (wizardData.selectedPlaces || []).reduce((sum, p) => sum + (p.entrance_fee_inr || 0) * travellers, 0);
  const hotelsTotal = sortedHotels.reduce((sum, h) => sum + ((h.price_per_night_inr || h.price_inr || 0) * (h.nights || 1) * (h.rooms || 1)), 0);
  const ridesTotal = selectedRides.reduce((sum, r) => sum + (r.price || 0), 0);
  const cafesTotal = (wizardData.selectedCafes || []).reduce((sum, c) => sum + (c.rate_for_two || 500) * Math.ceil((c.seats || 2) / 2), 0);
  const restTotal = (wizardData.selectedRestaurants || []).reduce((sum, r) => sum + (r.price || 400) * Math.ceil((r.seats || 2) / 2), 0);
  const diningTotal = cafesTotal + restTotal;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-[#D4B15A] uppercase tracking-widest bg-[#D4B15A]/10 px-3 py-1 rounded-full border border-[#D4B15A]/20">
          Step 7: Review Custom Selections
        </span>
        <h2 className="text-3xl font-display font-bold text-gray-900 mt-2">
          Confirm Your Customized Trip Preferences
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          Review your scheduled spots, multi-hotel stays, ground rides, and dining reservations for {travellers} traveller{travellers > 1 ? 's' : ''}.
        </p>
      </div>

      {/* Grand Total Spending Banner */}
      <div className="bg-gradient-to-r from-[#121619] via-gray-900 to-[#121619] text-white p-6 rounded-3xl shadow-xl border border-[#D4B15A]/30 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#D4B15A]/20 flex items-center justify-center text-[#D4B15A] text-xl">
            <FontAwesomeIcon icon={faWallet} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#D4B15A] uppercase tracking-widest">Total Estimated Spending ({travellers} Travellers)</p>
            <h3 className="text-3xl font-extrabold text-white">₹{totalCost.toLocaleString()}</h3>
          </div>
        </div>

        <button
          onClick={onConfirmGenerate}
          disabled={loading}
          className="w-full sm:w-auto bg-[#D4B15A] hover:bg-[#b89542] text-black font-extrabold px-8 py-3.5 rounded-2xl transition-all shadow-lg hover:scale-105 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
              <span>Generating Custom Itinerary...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faWandMagicSparkles} />
              <span>CONFIRM & GENERATE ITINERARY</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive OpenRouteService Routing & Google Places Search Panel */}
      <RouteMapPanel initialStops={wizardData.selectedPlaces || []} />

      {/* Itemized Calculation Sub-Totals Breakdown Box */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm mb-8">
        <h4 className="text-xs font-extrabold uppercase text-[#D4B15A] tracking-wider mb-3 flex items-center gap-2">
          <FontAwesomeIcon icon={faListOl} /> Itemized Total Calculation Summary ({travellers} Travellers)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold block">Outbound Flight/Bus</span>
            <span className="font-extrabold text-gray-900 text-xs">₹{outboundTotal.toLocaleString()}</span>
            <span className="text-[9px] text-gray-400 block">({travellers} × ₹{outboundPrice.toLocaleString()})</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold block">Return Flight/Bus</span>
            <span className="font-extrabold text-gray-900 text-xs">₹{returnTotal.toLocaleString()}</span>
            <span className="text-[9px] text-gray-400 block">({travellers} × ₹{returnPrice.toLocaleString()})</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold block">Tourist Spot Fees</span>
            <span className="font-extrabold text-gray-900 text-xs">₹{spotsTotal.toLocaleString()}</span>
            <span className="text-[9px] text-gray-400 block">({travellers} Travellers)</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold block">Hotel Stays</span>
            <span className="font-extrabold text-gray-900 text-xs">₹{hotelsTotal.toLocaleString()}</span>
            <span className="text-[9px] text-gray-400 block">({sortedHotels.length} Properties)</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold block">Ground Rides</span>
            <span className="font-extrabold text-gray-900 text-xs">₹{ridesTotal.toLocaleString()}</span>
            <span className="text-[9px] text-gray-400 block">({selectedRides.length} Bookings)</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold block">Dining Reservations</span>
            <span className="font-extrabold text-gray-900 text-xs">₹{diningTotal.toLocaleString()}</span>
            <span className="text-[9px] text-gray-400 block">({(wizardData.selectedCafes?.length || 0) + (wizardData.selectedRestaurants?.length || 0)} Slots)</span>
          </div>
        </div>
      </div>

      {/* Summary Sections */}
      <div className="space-y-6 mb-8">
        
        {/* Section 0: Intercity Transport Tickets */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <FontAwesomeIcon icon={faPlane} className="text-[#D4B15A]" />
              Intercity Transport Tickets ({travellers} Travellers)
            </h3>
            <button 
              onClick={() => onJumpToStep(6)}
              className="text-xs font-bold text-[#D4B15A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FontAwesomeIcon icon={faEdit} /> Edit Tickets
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Outbound */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#D4B15A] bg-white px-2 py-0.5 rounded border border-gray-200">
                  Outbound Ticket (Day 1)
                </span>
                <h4 className="font-bold text-gray-900 mt-1">
                  {wizardData.outboundTransport ? `${wizardData.outboundTransport.operator} (${wizardData.outboundTransport.type.toUpperCase()})` : 'Default Economy Transport'}
                </h4>
                <p className="text-gray-500 text-[11px]">
                  {wizardData.outboundTransport ? `${wizardData.outboundTransport.depTime} - ${wizardData.outboundTransport.arrTime}` : 'Standard schedule'}
                </p>
                <span className="text-[10px] text-gray-400 block mt-0.5">₹{outboundPrice.toLocaleString()} / seat × {travellers} travellers</span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-gray-900">
                  ₹{outboundTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Return */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#D4B15A] bg-white px-2 py-0.5 rounded border border-gray-200">
                  Return Ticket (Last Day)
                </span>
                <h4 className="font-bold text-gray-900 mt-1">
                  {wizardData.returnTransport ? `${wizardData.returnTransport.operator} (${wizardData.returnTransport.type.toUpperCase()})` : 'Default Economy Transport'}
                </h4>
                <p className="text-gray-500 text-[11px]">
                  {wizardData.returnTransport ? `${wizardData.returnTransport.depTime} - ${wizardData.returnTransport.arrTime}` : 'Standard schedule'}
                </p>
                <span className="text-[10px] text-gray-400 block mt-0.5">₹{returnPrice.toLocaleString()} / seat × {travellers} travellers</span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-gray-900">
                  ₹{returnTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Scheduled Spots */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <FontAwesomeIcon icon={faLandmark} className="text-[#D4B15A]" />
              Scheduled Tourist Hubs ({wizardData.selectedPlaces.length})
            </h3>
            <button 
              onClick={() => onJumpToStep(1)}
              className="text-xs font-bold text-[#D4B15A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FontAwesomeIcon icon={faEdit} /> Edit Spots & Schedule
            </button>
          </div>

          {wizardData.selectedPlaces.length === 0 ? (
            <p className="text-xs text-gray-400">No tourist hubs selected. AI will auto-select spots.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wizardData.selectedPlaces.map(p => {
                const sched = scheduleData[p.id] || { day: 'Day 1', timeSlot: 'Morning' };
                const spotTotal = (p.entrance_fee_inr || 0) * travellers;
                return (
                  <div key={p.id} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#D4B15A] bg-white px-2 py-0.5 rounded border border-gray-200">
                        {sched.day} • {sched.timeSlot}
                      </span>
                      <h4 className="font-bold text-gray-900 mt-1">{p.name}</h4>
                      <p className="text-gray-500 text-[11px]">📍 {p.city} • Fee: {p.entrance_fee_inr > 0 ? `₹${p.entrance_fee_inr} / person` : 'Free'}</p>
                      
                      <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] flex flex-wrap gap-x-2 gap-y-1 text-gray-600">
                        <span><FontAwesomeIcon icon={faCamera} className="text-gray-400" /> DSLR: {p.dslr_allowed}</span>
                        <span><FontAwesomeIcon icon={faCalendarCheck} className="text-gray-400" /> Off: {p.weekly_off}</span>
                      </div>
                    </div>

                    {p.entrance_fee_inr > 0 && (
                      <div className="text-right shrink-0">
                        <span className="font-bold text-gray-900 text-xs">₹{spotTotal.toLocaleString()}</span>
                        <span className="text-[9px] text-gray-400 block">({travellers} travellers)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Multi-Hotel Stays Sequence */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <FontAwesomeIcon icon={faHotel} className="text-[#D4B15A]" />
              Accommodations Stay Sequence ({sortedHotels.length})
            </h3>
            <button 
              onClick={() => onJumpToStep(3)}
              className="text-xs font-bold text-[#D4B15A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FontAwesomeIcon icon={faEdit} /> Edit Hotels
            </button>
          </div>

          {sortedHotels.length === 0 ? (
            <p className="text-xs text-gray-400">No hotel selected. AI will suggest standard hotels.</p>
          ) : (
            <div className="space-y-3">
              {sortedHotels.map((h, idx) => {
                const stayTotal = (h.price_per_night_inr || h.price_inr || 0) * (h.nights || 1) * (h.rooms || 1);
                return (
                  <div key={h.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D4B15A] bg-white px-2 py-0.5 rounded border border-gray-200">
                        Stay #{idx + 1} • {h.hotel_stars} ★
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm mt-1">{h.property_name || h.name}</h4>
                      <p className="text-gray-500">📍 {h.address || h.city} • {h.nights || 1} Night(s) • {h.rooms || 1} Room(s)</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-gray-900">
                        ₹{stayTotal.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 block">₹{h.price_per_night_inr || h.price_inr} / night</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: Multi-Ride Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <FontAwesomeIcon icon={faCarSide} className="text-[#D4B15A]" />
              Booked Transport Rides ({selectedRides.length})
            </h3>
            <button 
              onClick={() => onJumpToStep(4)}
              className="text-xs font-bold text-[#D4B15A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FontAwesomeIcon icon={faEdit} /> Edit Rides
            </button>
          </div>

          {selectedRides.length === 0 ? (
            <p className="text-xs text-gray-400">Skipped ride bookings.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {selectedRides.map(r => (
                <div key={r.ride_id} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#D4B15A] bg-white px-2 py-0.5 rounded border border-gray-200">
                      {r.vehicle_category} • {r.booking_type}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1">{r.vehicle_model}</h4>
                    <p className="text-gray-500">📍 Destination: {r.tourist_place || r.city}</p>
                  </div>
                  <span className="text-base font-extrabold text-gray-900">
                    ₹{r.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Cafes & Restaurants */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <FontAwesomeIcon icon={faUtensils} className="text-[#D4B15A]" />
              Cafes & Dining Reservations ({wizardData.selectedCafes.length + wizardData.selectedRestaurants.length})
            </h3>
            <button 
              onClick={() => onJumpToStep(5)}
              className="text-xs font-bold text-[#D4B15A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FontAwesomeIcon icon={faEdit} /> Edit Dining
            </button>
          </div>

          {wizardData.selectedCafes.length === 0 && wizardData.selectedRestaurants.length === 0 ? (
            <p className="text-xs text-gray-400">No dining reservations added.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {wizardData.selectedCafes.map(c => (
                <div key={c.id} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-[#D4B15A] uppercase bg-white px-2 py-0.5 rounded border border-gray-200">
                      Cafe • {c.day || 'Day 1'} {c.timeSlot || 'Lunch'}
                    </span>
                    <p className="font-bold text-gray-900 text-sm mt-1">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.seats} Guests Reserved</p>
                  </div>
                  <span className="font-bold text-gray-800 text-sm">₹{c.rate_for_two.toLocaleString()}</span>
                </div>
              ))}
              {wizardData.selectedRestaurants.map(r => (
                <div key={r.id} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-[#D4B15A] uppercase bg-white px-2 py-0.5 rounded border border-gray-200">
                      Restaurant • {r.day || 'Day 1'} {r.timeSlot || 'Dinner'}
                    </span>
                    <p className="font-bold text-gray-900 text-sm mt-1">{r.name}</p>
                    <p className="text-[10px] text-gray-400">{r.seats} Guests Reserved</p>
                  </div>
                  <span className="font-bold text-gray-800 text-sm">₹{r.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Bottom Nav */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={() => onJumpToStep(5)}
          className="px-6 py-3 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dining
        </button>

        <button
          onClick={onConfirmGenerate}
          disabled={loading}
          className="px-8 py-3 bg-[#D4B15A] hover:bg-[#b89542] text-black font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faWandMagicSparkles} />
          <span>{loading ? 'Generating...' : 'CONFIRM & GENERATE ITINERARY'}</span>
        </button>
      </div>

    </div>
  );
}
