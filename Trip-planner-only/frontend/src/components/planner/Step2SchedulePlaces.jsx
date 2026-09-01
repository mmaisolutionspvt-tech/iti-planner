import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarDays, 
  faClock, 
  faArrowRight, 
  faArrowLeft, 
  faSun, 
  faCloudSun, 
  faMoon, 
  faClockRotateLeft 
} from '@fortawesome/free-solid-svg-icons';

export default function Step2SchedulePlaces({ selectedPlaces, scheduleData, onUpdateSchedule, onNext, onBack, totalDays = 3, outboundTransport = null, returnTransport = null }) {
  const timeSlots = [
    { id: 'Morning', label: 'Morning (9:00 AM - 12:00 PM)', icon: faSun, color: 'text-amber-500' },
    { id: 'Afternoon', label: 'Afternoon (12:00 PM - 4:00 PM)', icon: faCloudSun, color: 'text-orange-500' },
    { id: 'Evening', label: 'Evening (4:00 PM - 8:00 PM)', icon: faClockRotateLeft, color: 'text-[#D4B15A]' },
    { id: 'Night', label: 'Night (8:00 PM - 11:00 PM)', icon: faMoon, color: 'text-indigo-400' },
  ];

  const daysList = Array.from({ length: totalDays }, (_, i) => `Day ${i + 1}`);

  return (
    <div className="w-full p-4 sm:p-6">
      
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <span className="text-xs font-bold text-[#D4B15A] uppercase tracking-widest bg-[#D4B15A]/10 px-3 py-1 rounded-full border border-[#D4B15A]/20">
          Step 3: Time & Schedule Assignment
        </span>
        <h2 className="text-3xl font-display font-bold text-gray-900 mt-2">
          Schedule Your Selected Attractions
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Tell us which day and time slot you would like to visit each tourist hub.
        </p>
      </div>

      {/* Booked Transport Banner */}
      {(outboundTransport || returnTransport) && (
        <div className="mb-6 bg-[#121619] text-white p-4 rounded-2xl border border-[#D4B15A]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div>
            <span className="text-[10px] font-extrabold text-[#D4B15A] uppercase tracking-wider block mb-0.5">
              Booked Flight / Bus Timings
            </span>
            <p className="text-gray-300 font-medium">
              {outboundTransport ? `🛫 Day 1 Arrival: ${outboundTransport.arrTime} (${outboundTransport.operator})` : ''}
              {outboundTransport && returnTransport ? '  |  ' : ''}
              {returnTransport ? `🛬 Last Day Departure: ${returnTransport.depTime} (${returnTransport.operator})` : ''}
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/30">
            Schedule your spots after arrival time
          </span>
        </div>
      )}

      {selectedPlaces.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500 mb-4">No tourist hubs selected yet.</p>
          <button 
            onClick={onBack}
            className="bg-[#121619] text-[#D4B15A] px-6 py-2.5 rounded-xl font-bold text-xs"
          >
            ← Go Back to Select Places
          </button>
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {selectedPlaces.map((place, idx) => {
            const currentSched = scheduleData[place.id] || { day: `Day ${(idx % totalDays) + 1}`, timeSlot: 'Morning' };
            return (
              <div 
                key={place.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4B15A]/10 border border-[#D4B15A]/20 flex items-center justify-center text-[#D4B15A] font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#D4B15A] bg-gray-100 px-2 py-0.5 rounded-md">
                      {place.type || 'Spot'}
                    </span>
                    <h4 className="text-lg font-bold text-gray-900 mt-1">
                      {place.name}
                    </h4>
                    <p className="text-xs text-gray-400">📍 {place.city} • Approx {place.time_needed_to_visit_hrs} hrs visit</p>
                  </div>
                </div>

                {/* Selectors for Day & Time */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Day Picker */}
                  <div className="relative">
                    <FontAwesomeIcon icon={faCalendarDays} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <select
                      value={currentSched.day}
                      onChange={(e) => onUpdateSchedule(place.id, e.target.value, currentSched.timeSlot)}
                      className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-[#D4B15A] appearance-none cursor-pointer"
                    >
                      {daysList.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Time Slot Picker */}
                  <div className="relative">
                    <FontAwesomeIcon icon={faClock} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <select
                      value={currentSched.timeSlot}
                      onChange={(e) => onUpdateSchedule(place.id, currentSched.day, e.target.value)}
                      className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-[#D4B15A] appearance-none cursor-pointer"
                    >
                      {timeSlots.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Places
        </button>

        <button
          onClick={onNext}
          className="px-8 py-3 bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <span>Next: Hotel Selection</span>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

    </div>
  );
}
