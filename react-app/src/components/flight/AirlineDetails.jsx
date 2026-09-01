import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheckCircle, faSuitcase, faHamburger } from '@fortawesome/free-solid-svg-icons';

export default function AirlineDetails({ airline, onClose }) {
  if (!airline) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-xl font-bold text-[#121619]">
            {airline.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 font-display">{airline}</h3>
            <div className="flex items-center gap-1 text-sm text-emerald-600 mt-1">
              <FontAwesomeIcon icon={faCheckCircle} /> Verified Partner
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 border-b pb-2">Baggage Policy</h4>
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faSuitcase} className="mt-1 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Cabin Baggage</p>
              <p className="text-sm text-gray-500">7 kg (1 piece only) per passenger</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faSuitcase} className="mt-1 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Check-in Baggage</p>
              <p className="text-sm text-gray-500">15 kg (1 piece only) per passenger</p>
            </div>
          </div>

          <h4 className="font-bold text-gray-900 border-b pb-2 mt-6 pt-4">In-flight Services</h4>
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faHamburger} className="mt-1 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Meals</p>
              <p className="text-sm text-gray-500">Pre-book meals to save 20%. Hot meals available on flights over 2 hours.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
