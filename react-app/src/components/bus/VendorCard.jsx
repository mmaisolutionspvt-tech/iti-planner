import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faShieldAlt, faWifi, faChargingStation, faSnowflake, faIdCard } from '@fortawesome/free-solid-svg-icons';

export default function VendorCard({ vendor, onSelect, onViewDriver }) {
  // Map some basic amenities
  const hasAC = vendor.busType?.toLowerCase().includes('ac');
  
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col md:flex-row">
      <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden relative">
        <img src={`/files/${vendor.images?.[0] || 'bus1.jpg'}`} alt={vendor.name} className="w-full h-full object-cover" />
        {vendor.rating > 4.5 && (
          <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
            <FontAwesomeIcon icon={faStar} /> Top Rated
          </div>
        )}
      </div>
      
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{vendor.name}</h3>
            <p className="text-gray-500 text-sm mb-3">{vendor.busType} • {vendor.seats} Seater</p>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1"><FontAwesomeIcon icon={faStar} className="text-yellow-400" /> {vendor.rating}/5</span>
              <span className="flex items-center gap-1 text-emerald-600"><FontAwesomeIcon icon={faShieldAlt} /> Verified</span>
            </div>
            <div className="flex gap-2">
              {hasAC && <div className="bg-blue-50 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center" title="A/C"><FontAwesomeIcon icon={faSnowflake} /></div>}
              <div className="bg-gray-50 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center" title="Charging"><FontAwesomeIcon icon={faChargingStation} /></div>
              <div className="bg-gray-50 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center" title="WiFi"><FontAwesomeIcon icon={faWifi} /></div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-[#121619]">₹{vendor.pricePerKm}/km</div>
            <p className="text-xs text-gray-500 mb-4">excluding taxes</p>
            <button 
              onClick={onSelect}
              className="bg-[#FFAA00] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#e00045] transition-colors w-full"
            >
              Select Seats
            </button>
            <button 
              onClick={onViewDriver}
              className="mt-2 text-[#121619] text-sm font-medium hover:underline flex items-center justify-end gap-1 w-full"
            >
              <FontAwesomeIcon icon={faIdCard} /> View Driver info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
