import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapPin, faClock, faUtensils, faBed, faRupeeSign, faLightbulb, faCar } from '@fortawesome/free-solid-svg-icons';

export default function TripPDFDocument({ plan }) {
  if (!plan) return null;

  const tripName = plan.trip_name || plan.title || 'Your Travel Itinerary';
  const totalDays = plan.total_days || plan.totalDays || 1;
  const budgetMin = plan.estimated_budget_inr?.min || plan.estimatedBudget?.min || 0;
  const budgetMax = plan.estimated_budget_inr?.max || plan.estimatedBudget?.max || 0;
  
  const tipsOrHighlights = plan.trip_summary?.highlights || plan.tips || [];
  const weatherNote = plan.trip_summary?.weather_note || null;
  const destinations = plan.destinations?.join(' → ') || '';
  const travelMode = plan.travel_mode || '';
  const budgetTier = plan.budget_tier ? plan.budget_tier.charAt(0).toUpperCase() + plan.budget_tier.slice(1) : '';
  const rawTripType = plan.trip_type || plan.tripType || 'Family Trip';

  const themeConfig = {
    'Couples / Romantic Trip': {
      wrapperBg: 'bg-gradient-to-br from-rose-50/80 via-pink-50/40 to-purple-50/60 p-6 md:p-10 rounded-3xl border-2 border-rose-200/80 shadow-xl shadow-rose-100/50',
      badge: 'bg-rose-600 text-white font-bold px-4 py-1 rounded-full text-xs uppercase tracking-wider shadow-sm inline-flex items-center gap-1.5',
      badgeText: '💖 Couples Romantic Getaway 🌹',
      titleColor: 'text-rose-950 font-serif',
      subText: 'text-rose-700/80 font-medium',
      tagColor: 'text-rose-600 font-bold',
      dayNumberColor: 'text-rose-600 font-serif',
      dotColor: 'bg-rose-500 border-4 border-rose-100 shadow-rose-200',
      cardBg: 'bg-white/90 border border-rose-100 shadow-sm hover:shadow-rose-100',
      accentBorder: 'border-rose-300',
      hotelIconBg: 'bg-rose-100 text-rose-600',
      quote: '🌹 "Travel is like love, mostly because it’s a heightened state of awareness in which we are mindful, receptive, and ready to transform."'
    },
    'Family Trip': {
      wrapperBg: 'bg-gradient-to-br from-emerald-50/80 via-amber-50/30 to-teal-50/60 p-6 md:p-10 rounded-3xl border-2 border-emerald-200/80 shadow-xl shadow-emerald-100/40',
      badge: 'bg-emerald-700 text-white font-bold px-4 py-1 rounded-full text-xs uppercase tracking-wider shadow-sm inline-flex items-center gap-1.5',
      badgeText: '👨‍👩‍👧‍👦 Family Comfort Itinerary 🏡',
      titleColor: 'text-emerald-950 font-display',
      subText: 'text-emerald-800 font-medium',
      tagColor: 'text-emerald-700 font-bold',
      dayNumberColor: 'text-emerald-700 font-bold',
      dotColor: 'bg-emerald-600 border-4 border-emerald-100 shadow-emerald-200',
      cardBg: 'bg-white/90 border border-emerald-100 shadow-sm',
      accentBorder: 'border-emerald-300',
      hotelIconBg: 'bg-emerald-100 text-emerald-700',
      quote: '👨‍👩‍👧‍👦 "In the end, kids won’t remember that fancy toy you bought them, they will remember the time you spent with them."'
    },
    'Friends Trip': {
      wrapperBg: 'bg-gradient-to-br from-violet-50/80 via-fuchsia-50/30 to-orange-50/60 p-6 md:p-10 rounded-3xl border-2 border-violet-200/80 shadow-xl shadow-violet-100/40',
      badge: 'bg-gradient-to-r from-violet-600 to-orange-500 text-white font-bold px-4 py-1 rounded-full text-xs uppercase tracking-wider shadow-sm inline-flex items-center gap-1.5',
      badgeText: '⚡ Friends Squad Adventure 🤙 🔥',
      titleColor: 'text-violet-950 font-display',
      subText: 'text-violet-800 font-medium',
      tagColor: 'text-violet-600 font-bold',
      dayNumberColor: 'text-violet-600 font-bold',
      dotColor: 'bg-violet-600 border-4 border-violet-100 shadow-violet-200',
      cardBg: 'bg-white/90 border border-violet-100 shadow-sm',
      accentBorder: 'border-violet-300',
      hotelIconBg: 'bg-violet-100 text-violet-600',
      quote: '⚡ "Good times and crazy friends make the best memories."'
    },
    'Corporate / Business Trip': {
      wrapperBg: 'bg-slate-50 p-6 md:p-10 rounded-2xl border border-slate-200 shadow-md',
      badge: 'bg-slate-800 text-slate-100 font-bold px-3 py-1 rounded text-xs uppercase tracking-wider inline-flex items-center gap-1.5',
      badgeText: '💼 Executive Business Itinerary 👔',
      titleColor: 'text-slate-900 font-sans',
      subText: 'text-slate-600 font-medium',
      tagColor: 'text-slate-700 font-bold',
      dayNumberColor: 'text-slate-800 font-bold',
      dotColor: 'bg-slate-800 border-4 border-slate-200',
      cardBg: 'bg-white border border-slate-200 shadow-sm',
      accentBorder: 'border-slate-300',
      hotelIconBg: 'bg-slate-100 text-slate-700',
      quote: '💼 "Efficiency and comfort for seamless business travel."'
    },
    'Solo Trip': {
      wrapperBg: 'bg-gradient-to-br from-teal-50/80 via-amber-50/30 to-emerald-50/60 p-6 md:p-10 rounded-3xl border-2 border-teal-200/80 shadow-xl shadow-teal-100/40',
      badge: 'bg-teal-700 text-white font-bold px-4 py-1 rounded-full text-xs uppercase tracking-wider shadow-sm inline-flex items-center gap-1.5',
      badgeText: '🗺️ Solo Explorer Circuit 🧭',
      titleColor: 'text-teal-950 font-display',
      subText: 'text-teal-800 font-medium',
      tagColor: 'text-teal-700 font-bold',
      dayNumberColor: 'text-teal-700 font-bold',
      dotColor: 'bg-teal-600 border-4 border-teal-100 shadow-teal-200',
      cardBg: 'bg-white/90 border border-teal-100 shadow-sm',
      accentBorder: 'border-teal-300',
      hotelIconBg: 'bg-teal-100 text-teal-700',
      quote: '🧭 "To travel alone is to take a journey into oneself."'
    }
  };

  const currentTheme = themeConfig[rawTripType] || themeConfig['Family Trip'];

  return (
    <div className={`text-gray-900 ${currentTheme.wrapperBg}`}>
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-200/60">
        <div className="mb-3">
          <span className={currentTheme.badge}>{currentTheme.badgeText}</span>
        </div>
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${currentTheme.titleColor}`}>{tripName}</h1>
        <p className={`text-base md:text-lg ${currentTheme.subText}`}>{totalDays} Days • Estimated Budget: ₹{budgetMin.toLocaleString()} - ₹{budgetMax.toLocaleString()}</p>
        {destinations && <p className={`text-sm font-semibold mt-1 ${currentTheme.tagColor}`}>📍 {destinations} &nbsp;|&nbsp; {travelMode} &nbsp;|&nbsp; {budgetTier} budget</p>}
        {weatherNote && <p className="text-sm font-medium text-emerald-700 mt-2">🌤 {weatherNote}</p>}
        {currentTheme.quote && <p className="text-xs italic text-gray-500 mt-3 max-w-xl mx-auto">{currentTheme.quote}</p>}
      </div>

      {/* Intercity Transport Summary */}
      {plan.intercity_transport && (plan.intercity_transport.outbound || plan.intercity_transport.return) && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 break-inside-avoid transport-card">
          {['outbound', 'return'].map(leg => {
            const t = plan.intercity_transport[leg];
            if (!t) return null;
            return (
              <div key={leg} className="bg-[#121619]/5 border border-[#121619]/10 rounded-2xl p-5">
                <p className="text-xs font-bold text-[#D4B15A] uppercase tracking-widest mb-2">{leg === 'outbound' ? '✈️ Outbound Journey' : '🔄 Return Journey'}</p>
                <p className="font-bold text-gray-900">{t.from} → {t.to}</p>
                <p className="text-sm text-gray-600 mt-1">{t.mode} {t.operator ? `• ${t.operator}` : ''} {t.airline ? `• ${t.airline}` : ''}</p>
                <p className="text-sm text-gray-500 mt-1">🕐 Departs {t.dep_time} → Arrives {t.arr_time} ({t.duration})</p>
                {t.cost_inr > 0 && <p className="text-sm font-semibold text-[#121619] mt-1">₹{t.cost_inr.toLocaleString()} per person</p>}
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-8">
        {plan.days?.map((day, i) => {
          const location = day.city || day.location || '';
          const activities = day.schedule || day.activities || [];
          const travelTime = day.total_travel_time_min ? `${Math.floor(day.total_travel_time_min/60)}h ${day.total_travel_time_min%60}m` : day.travelTime;
          
          return (
            <div key={i} className="relative pl-8 md:pl-0 day-container break-inside-avoid">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-[120px] top-0 bottom-0 w-0.5 bg-gray-100"></div>
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 relative">
                
                {/* Day Header */}
                <div className="md:w-[100px] shrink-0 pt-2 relative">
                  {/* Timeline dot */}
                  <div className={`hidden md:block absolute right-[-24px] top-4 w-4 h-4 rounded-full ${currentTheme.dotColor}`}></div>
                  <div className="md:text-right">
                    <h3 className={`text-2xl font-bold ${currentTheme.dayNumberColor}`}>Day {day.day}</h3>
                    <p className="text-xs text-gray-500 font-semibold">{day.date}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-wider">{location}</p>
                  </div>
                </div>

                {/* Day Content */}
                <div className={`flex-1 rounded-2xl p-6 transition-all duration-300 ${currentTheme.cardBg}`}>
                  
                  {/* Hotel */}
                  {day.hotel && day.hotel.name && day.hotel.name.toLowerCase() !== 'n/a' && day.hotel.name !== 'null' && (
                    <div className="flex items-start gap-3 mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hotel-card break-inside-avoid">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faBed} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Stay at {day.hotel.name}</h4>
                        <div className="flex gap-3 text-sm text-gray-500 mt-1">
                          {day.hotel.rating && <span>★ {day.hotel.rating}</span>}
                          {(day.hotel.price_per_night_inr || day.hotel.price) > 0 && 
                            <span>₹{day.hotel.price_per_night_inr || day.hotel.price}/night</span>
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Activities */}
                  <div className="space-y-5">
                    {activities.map((act, j) => {
                      const typeColor = {
                        meal: 'bg-orange-50 text-orange-600 border-orange-200',
                        food: 'bg-orange-50 text-orange-600 border-orange-200',
                        transport: 'bg-blue-50 text-blue-600 border-blue-200',
                        sightseeing: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                        adventure: 'bg-red-50 text-red-600 border-red-200',
                        trekking: 'bg-lime-50 text-lime-700 border-lime-200',
                        shopping: 'bg-purple-50 text-purple-600 border-purple-200',
                        leisure: 'bg-sky-50 text-sky-600 border-sky-200',
                        rest: 'bg-gray-50 text-gray-500 border-gray-200',
                        admin: 'bg-gray-50 text-gray-500 border-gray-200',
                      }[act.type] || 'bg-gray-50 text-gray-500 border-gray-200';

                      const typeIcon = {
                        meal: '🍽️', food: '🍽️', transport: '🚌', sightseeing: '🏛️',
                        adventure: '🏔️', trekking: '🥾', shopping: '🛍️',
                        leisure: '🌅', rest: '😴', admin: '📋'
                      }[act.type] || '📍';

                      return (
                        <div key={j} className="flex gap-4 group activity-card break-inside-avoid">
                          {/* Time column */}
                          <div className="w-14 shrink-0 text-sm font-bold text-[#D4B15A] pt-1 font-mono">{act.time}</div>
                          
                          {/* Content */}
                          <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 text-sm leading-snug">
                                {typeIcon} {act.place || act.activity}
                              </h4>
                              <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeColor}`}>
                                {act.type}
                              </span>
                            </div>
                            
                            {act.place && act.activity && (
                              <p className="text-gray-600 text-sm mt-1 leading-relaxed">{act.activity}</p>
                            )}

                            {/* Notes */}
                            {act.notes && (
                              <p className="text-amber-700 text-xs mt-1.5 bg-amber-50 rounded-lg px-2 py-1 border border-amber-100">
                                💡 {act.notes}
                              </p>
                            )}
                            
                            {/* Meta row */}
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400 font-medium">
                              {act.duration_min > 0 && (
                                <span className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faClock} className="text-[10px]" /> 
                                  {act.duration_min} min
                                </span>
                              )}
                              {act.cost_inr > 0 && (
                                <span className="flex items-center gap-1 text-[#121619] font-semibold">
                                  <FontAwesomeIcon icon={faRupeeSign} className="text-[10px]" /> 
                                  {act.cost_inr.toLocaleString()}
                                </span>
                              )}
                              {act.dist_km > 0 && (
                                <span className="flex items-center gap-1">
                                  📏 {act.dist_km} km
                                </span>
                              )}
                              {act.travel_min > 0 && (
                                <span className="flex items-center gap-1">
                                  🚗 {act.travel_min} min travel
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Travel Time */}
                  {travelTime && (
                    <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500 flex items-center gap-2 font-medium">
                      <FontAwesomeIcon icon={faClock} className="text-gray-400" /> Total Travel Time: {travelTime}
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Tips / Highlights */}
      {tipsOrHighlights.length > 0 && (
        <div className="mt-8 bg-[#121619]/5 border border-[#121619]/10 rounded-2xl p-6 tips-box break-inside-avoid">
          <h3 className="text-xl font-bold text-[#121619] mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500" /> Trip Highlights & Tips
          </h3>
          <ul className="space-y-2">
            {tipsOrHighlights.map((tip, i) => (
              <li key={i} className="flex gap-3 text-gray-700">
                <span className="text-[#D4B15A] mt-1">✦</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Budget Breakdown & Itemized Total Spending */}
      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm budget-summary-box break-inside-avoid">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
          <h3 className="text-xl font-bold text-[#121619] flex items-center gap-2">
            <FontAwesomeIcon icon={faRupeeSign} className="text-[#D4B15A]" /> Customized Itemized Budget & Total Spending
          </h3>
          <span className="text-xs font-bold text-[#D4B15A] bg-[#D4B15A]/10 px-3 py-1 rounded-full">
            Calculated Preferences
          </span>
        </div>

        {plan.trip_summary?.budget_breakdown ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(plan.trip_summary.budget_breakdown).map(([key, val]) => (
              val > 0 && (
                <div key={key} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[11px] text-gray-400 font-semibold uppercase">{key.replace(/_inr$/, '').replace(/_/g, ' ')}</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">₹{Number(val).toLocaleString()}</p>
                </div>
              )
            ))}
          </div>
        ) : null}

        <div className="mt-6 pt-4 border-t-2 border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#121619] via-gray-900 to-[#121619] p-5 rounded-2xl text-white">
          <div>
            <p className="text-xs font-bold text-[#D4B15A] uppercase tracking-widest">Total Verified Spending (All Preferences)</p>
            <p className="text-xs text-gray-400 mt-0.5">Includes Outbound/Return Transport + Multi-Hotels + Ground Rides + Dining + Entrance Fees</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-display font-extrabold text-white">
              ₹{Number(plan.trip_summary?.total_cost_inr || plan.trip_summary?.total_cost || plan.estimated_budget_inr?.max || 44000).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer Branding for Print */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-center text-gray-500 text-xs break-inside-avoid">
        <p className="font-bold text-gray-700">Generated by Firstflight Travels AI</p>
        <p>Book your flights and buses seamlessly at firstflight-travels.com</p>
      </div>

    </div>
  );
}
