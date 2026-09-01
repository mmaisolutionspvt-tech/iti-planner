import HeroSection from '../components/home/HeroSection';
import ServiceCards from '../components/home/ServiceCards';
import LocationCards from '../components/home/LocationCards';
import PackageCards from '../components/home/PackageCards';
import Newsletter from '../components/home/Newsletter';
import LivingMap from '../components/home/LivingMap';
// import { motion } from 'framer-motion';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCameraRetro, faWandMagicSparkles, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../stores/useAppStore';

export default function Home() {
  const { addToast } = useAppStore();
  return (
    <div className="bg-gray-50">
      <HeroSection />
      
      {/* Schedule Trip CTA moved to HeroSection */}

      <LivingMap />
      <LocationCards />
      <PackageCards />
      <Newsletter />
      
      {/* UGC FAB */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        className="fixed bottom-6 right-6 z-[60]"
      >
        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              if (e.target.files && e.target.files[0]) {
                addToast({ type: 'success', message: `Photo "${e.target.files[0].name}" uploaded successfully! 📸` });
              }
            };
            input.click();
          }}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#FFAA00] to-[#FFBC1A] rounded-full text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer border-none"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75" />
          <FontAwesomeIcon icon={faCameraRetro} className="text-2xl relative z-10 group-hover:scale-110 transition-transform" />
          
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            Share Photo & Earn 🪙
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </button>
      </motion.div>
    </div>
  );
}
