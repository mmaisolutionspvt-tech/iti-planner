import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faBus, faCalendarDays, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import BookingSidebar from './BookingSidebar';
import useAppStore from '../../stores/useAppStore';

export default function HeroSection() {
  const navigate = useNavigate();
  const { isSidebarOpen, openSidebar, closeSidebar } = useAppStore();

  const handleSearch = (searchData) => {
    // Navigate to weather diagnostics first with search parameters
    const params = new URLSearchParams(searchData).toString();
    navigate(`/weather-diagnostics?${params}`);
    closeSidebar();
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      <video
        src="/files/bgvid.mp4"
        type="video/mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end">
        <div className="w-full md:w-[50%] flex flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-display font-bold text-white tracking-wider mb-6 drop-shadow-2xl leading-tight"
          >
            DISCOVER <br />
            <span className="text-[#D4B15A]">
              THE WORLD
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/90 text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light drop-shadow-md"
          >
            Plan your perfect getaway with AI-curated itineraries, smart weather diagnostics, and the most affordable packages.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/schedule-trip" className="inline-flex items-center gap-3 bg-[#D4B15A] hover:bg-[#b89542] text-white px-8 py-3.5 rounded-full font-bold shadow-[0_0_20px_rgba(212,177,90,0.4)] hover:shadow-[0_0_30px_rgba(212,177,90,0.6)] hover:scale-105 transition-all">
              Build AI Itinerary <FontAwesomeIcon icon={faWandMagicSparkles} />
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Booking Sidebar Component */}
      <BookingSidebar onSearch={handleSearch} />

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-1.5 rounded-full bg-white/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
