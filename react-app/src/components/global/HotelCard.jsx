import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faLocationDot, 
  faThumbsUp, 
  faThumbsDown, 
  faExternalLink, 
  faBuilding, 
  faBed, 
  faListUl, 
  faInfoCircle,
  faEye,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

export default function HotelCard({ hotel, onSelect, selectLabel = "Book Hotel" }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleDirections = (e) => {
    e.stopPropagation();
    if (hotel.latitude && hotel.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${hotel.latitude},${hotel.longitude}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    const count = Math.min(5, Math.max(1, Math.round(rating)));
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i} 
          icon={faStar} 
          className={i < count ? "text-[#D4B15A]" : "text-gray-300"} 
        />
      );
    }
    return stars;
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col justify-between group">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start gap-4 mb-2">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#D4B15A] bg-[#D4B15A]/10 px-2.5 py-1 rounded-md mb-2 inline-block">
                {hotel.property_type || 'Hotel'}
              </span>
              <h3 className="text-xl font-bold text-[#121619] leading-tight group-hover:text-[#D4B15A] transition-colors">
                {hotel.property_name}
              </h3>
            </div>
            
            {/* Stars */}
            <div className="flex gap-0.5 shrink-0 bg-gray-50 px-2 py-1 rounded-lg">
              {renderStars(hotel.hotel_stars || 3)}
            </div>
          </div>

          {/* Address & City */}
          <p className="text-gray-500 text-sm mb-3 font-medium flex items-start gap-1">
            <FontAwesomeIcon icon={faLocationDot} className="text-[#D4B15A] mt-1 shrink-0" />
            <span>{hotel.address || `${hotel.city}, ${hotel.state}, ${hotel.country}`}</span>
          </p>

          {/* Destination Details */}
          <div className="text-xs text-gray-400 mb-4 flex flex-wrap gap-x-3 gap-y-1">
            <span><strong>City:</strong> {hotel.city}</span>
            <span><strong>State:</strong> {hotel.state}</span>
            <span><strong>Country:</strong> {hotel.country}</span>
          </div>

          {/* Location button with Directions */}
          {hotel.latitude && hotel.longitude && (
            <button 
              onClick={handleDirections}
              className="text-xs font-semibold text-[#121619] hover:text-[#D4B15A] bg-gray-100 hover:bg-[#121619] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 mb-4 border border-gray-200"
            >
              <FontAwesomeIcon icon={faLocationDot} />
              View Location ({hotel.latitude.toFixed(4)}, {hotel.longitude.toFixed(4)}) & Get Directions
            </button>
          )}

          {/* Likes & Dislikes from positive/critical reviews */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <FontAwesomeIcon icon={faThumbsUp} /> {hotel.likes || 0} Likes
            </span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <FontAwesomeIcon icon={faThumbsDown} /> {hotel.dislikes || 0} Dislikes
            </span>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-2">
          <button 
            onClick={() => setShowDetails(true)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
          >
            <FontAwesomeIcon icon={faEye} />
            View Details
          </button>
          
          <button 
            onClick={() => onSelect(hotel)}
            className="flex-1 bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#121619]/10 hover:shadow-lg"
          >
            {selectLabel}
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center z-10">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#D4B15A] bg-[#D4B15A]/10 px-2.5 py-1 rounded-md mb-1 inline-block">
                  {hotel.property_type || 'Hotel'}
                </span>
                <h3 className="text-xl font-bold text-[#121619] leading-tight">
                  {hotel.property_name}
                </h3>
              </div>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Ratings and brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Brand / Category</p>
                  <p className="font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <FontAwesomeIcon icon={faBuilding} className="text-[#D4B15A] text-sm" />
                    {hotel.hotel_brand || 'independent hotel'} ({hotel.hotel_category || 'independent hotel'})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Site Review Rating</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex gap-0.5">
                      {renderStars(hotel.site_review_ratings || 4)}
                    </div>
                    <span className="font-bold text-gray-800 text-sm">({hotel.site_review_ratings || 4.0}/5)</span>
                  </div>
                </div>
              </div>

              {/* Guest Recommendation */}
              {hotel.guest_recommendations && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase mb-1">Guest Recommendation</p>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${hotel.guest_recommendations}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-emerald-600 mt-1">{hotel.guest_recommendations}% of guests recommend this property</p>
                </div>
              )}

              {/* Hotel Description */}
              {hotel.hotel_description && (
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">About the Property</h4>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                    {hotel.hotel_description}
                  </p>
                </div>
              )}

              {/* Room details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faBed} className="text-[#D4B15A]" />
                    Room Selection
                  </h4>
                  <p className="text-sm text-gray-700 font-semibold bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    {hotel.room_type || 'Standard Room'} {hotel.room_count ? `(${hotel.room_count} Rooms Available)` : ''}
                  </p>
                </div>
                {hotel.page_url && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faExternalLink} className="text-[#D4B15A]" />
                      Official Website
                    </h4>
                    <a 
                      href={hotel.page_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-semibold text-blue-600 hover:underline bg-blue-50 hover:bg-blue-100 px-3 py-2.5 rounded-xl flex items-center gap-1 border border-blue-100 break-all"
                    >
                      View on Goibibo <FontAwesomeIcon icon={faExternalLink} className="text-[10px]" />
                    </a>
                  </div>
                )}
              </div>

              {/* Hotel Facilities */}
              {hotel.hotel_facilities && hotel.hotel_facilities.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faListUl} className="text-[#D4B15A]" />
                    Hotel Facilities
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {hotel.hotel_facilities.map(facility => (
                      <span key={facility} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors font-medium">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Facilities */}
              {hotel.room_facilities && hotel.room_facilities.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faListUl} className="text-[#D4B15A]" />
                    Room Amenities
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {hotel.room_facilities.map(facility => (
                      <span key={facility} className="text-xs bg-[#D4B15A]/10 text-[#85651c] px-3 py-1 rounded-lg font-medium">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Point of Interest */}
              {hotel.point_of_interest && hotel.point_of_interest.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faLocationDot} className="text-[#D4B15A]" />
                    Nearby Attractions & Hotspots
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {hotel.point_of_interest.map(poi => (
                      <span key={poi} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-lg font-medium">
                        🗺️ {poi}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {hotel.additional_information && (
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-[#D4B15A]" />
                    Additional Information / Check-in Rules
                  </h4>
                  <p className="text-xs text-gray-500 bg-yellow-50/50 p-3.5 rounded-xl border border-yellow-100 leading-relaxed whitespace-pre-line">
                    {hotel.additional_information}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3 z-10">
              <button 
                onClick={() => setShowDetails(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer text-sm"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowDetails(false);
                  onSelect(hotel);
                }}
                className="bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer text-sm shadow-md"
              >
                {selectLabel}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
