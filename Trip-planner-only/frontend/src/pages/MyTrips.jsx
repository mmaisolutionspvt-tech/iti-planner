import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMapLocationDot, faCalendarCheck, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../stores/useAppStore';

export default function MyTrips() {
  const { savedTrips, removeTrip } = useAppStore();

  return (
    <div className="pt-24 min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 font-display mb-2"
          >
            My Trips
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500"
          >
            Manage your saved itineraries and bookings
          </motion.p>
        </div>

        {(!savedTrips || savedTrips.length === 0) ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto mt-20"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faBoxOpen} className="text-4xl text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-500 mb-8">You haven't saved any trip plans or made any bookings yet.</p>
            <a href="/schedule-trip" className="bg-[#121619] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1e2429] transition-colors inline-block">
              Plan a Trip Now
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedTrips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group"
              >
                <button 
                  onClick={() => removeTrip(trip.id)}
                  className="absolute top-4 right-4 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                  title="Delete trip"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">{trip.title || 'Saved Trip'}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faMapLocationDot} />
                    </div>
                    <span className="font-medium text-sm truncate">{trip.locations?.join(', ') || 'Various Locations'}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faCalendarCheck} />
                    </div>
                    <span className="font-medium text-sm">Saved on {new Date(trip.savedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-[#121619]">{trip.totalDays || 0} Days</span>
                  <button className="text-sm font-medium text-[#FFAA00] hover:underline">View Details</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}
