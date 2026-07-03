import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faIdBadge, faLanguage, faPhone, faStar } from '@fortawesome/free-solid-svg-icons';

export default function DriverDetails({ vendor, onClose }) {
  if (!vendor || !vendor.driver) return null;
  const { driver } = vendor;

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

        <h3 className="text-2xl font-bold text-gray-900 mb-6 font-display">Driver Profile</h3>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-2 border-[#121619]">
            {driver.photo ? (
               <img src={`/files/${driver.photo}`} alt={driver.name} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-3xl">👨‍✈️</div>
            )}
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">{driver.name}</h4>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400" /> 
              {driver.rating || 4.8}/5 Rating
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faIdBadge} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">License & Experience</div>
              <div className="text-gray-900 font-medium">Valid Heavy Vehicle License</div>
              <div className="text-sm text-gray-600">{driver.experience || 5} Years Experience</div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faLanguage} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Languages Spoken</div>
              <div className="text-gray-900 font-medium">{(driver.languages || ['Hindi', 'English']).join(', ')}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faPhone} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Emergency Contact</div>
              <div className="text-gray-900 font-medium">{driver.phone || '+91 XXXXX XXXXX'}</div>
              <div className="text-sm text-gray-600">Available during trip</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
