import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faSuitcaseRolling, faUtensils, faClock } from '@fortawesome/free-solid-svg-icons';

export default function FlightCard({ flight, onSelect, onViewAirline }) {
  // Mock airlines data if images are missing
  const airlineLogo = `/files/${flight.airline?.toLowerCase().replace(/\s+/g, '')}.png`;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center">
      
      {/* Airline Info */}
      <div className="w-full md:w-48 flex flex-col items-center justify-center shrink-0">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
          <FontAwesomeIcon icon={faPlane} className="text-2xl text-gray-400" />
        </div>
        <h4 className="font-bold text-gray-900 text-center">{flight.airline}</h4>
        <p className="text-xs text-gray-500">{flight.flightNumber}</p>
        <button onClick={onViewAirline} className="text-xs text-[#121619] hover:underline mt-2">View details</button>
      </div>

      {/* Flight Timing */}
      <div className="flex-1 w-full flex items-center justify-between">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{flight.departureTime}</div>
          <div className="text-sm text-gray-500">{flight.departure}</div>
        </div>
        
        <div className="flex-1 px-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <FontAwesomeIcon icon={faClock} /> {flight.duration}
          </div>
          <div className="w-full flex items-center">
            <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-white"></div>
            <div className="flex-1 h-px bg-gray-300 border-t border-dashed border-gray-400"></div>
            <FontAwesomeIcon icon={faPlane} className="text-gray-400 mx-2 text-sm" />
            <div className="flex-1 h-px bg-gray-300 border-t border-dashed border-gray-400"></div>
            <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-white"></div>
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium text-center">
            {flight.stops === 0 ? <span className="text-emerald-500">Non-stop</span> : `${flight.stops} Stop(s)`}
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{flight.arrivalTime}</div>
          <div className="text-sm text-gray-500">{flight.arrival}</div>
        </div>
      </div>

      {/* Price & Action */}
      <div className="w-full md:w-48 shrink-0 flex flex-col md:items-end justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
        <div className="text-3xl font-bold text-[#121619] mb-1">₹{flight.price}</div>
        <p className="text-xs text-gray-500 mb-4">per adult</p>
        
        <div className="flex gap-3 mb-4 text-gray-400 text-sm">
          <div title="15kg Check-in baggage included"><FontAwesomeIcon icon={faSuitcaseRolling} /></div>
          {flight.meals && <div title="Free meals included"><FontAwesomeIcon icon={faUtensils} /></div>}
        </div>

        <button 
          onClick={onSelect}
          className="bg-[#121619] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1e2429] transition-colors w-full"
        >
          Book Now
        </button>
      </div>
      
    </div>
  );
}
