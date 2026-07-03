import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark, faUser } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../stores/useAppStore';
import LoginModal from '../global/LoginModal';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isLoginModalOpen, openLoginModal, closeLoginModal } = useAppStore();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/locations', label: 'Locations' },
    { to: '/packages', label: 'Packages' },
    { to: '/my-trips', label: 'My Trips' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact Us' },
  ];

  const handleLogoClick = (e) => {
    // Logo click now just goes to Home, no longer opens sidebar
  };

  return (
    <>
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#121619]/95 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
          <img src="/files/logo.png" alt="Firstflight Travels" className="h-10 w-10 object-contain" />
          <span className="text-white font-bold text-lg hidden sm:block font-display">Firstflight</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                location.pathname === link.to
                  ? 'bg-white text-[#121619] shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-2 bg-[#D4B15A]/20 border border-[#D4B15A]/30 rounded-full pl-2 pr-4 py-1.5 cursor-pointer hover:bg-[#D4B15A]/30 transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#D4B15A] flex items-center justify-center text-white text-xs font-bold uppercase">
                {user.name ? user.name.charAt(0) : user.email.charAt(0)}
              </div>
              <span className="text-[#D4B15A] text-sm font-semibold truncate max-w-[100px]">
                {user.name || user.email.split('@')[0]}
              </span>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="flex items-center gap-2 bg-[#D4B15A] hover:bg-[#b89542] text-white px-5 py-2 rounded-full font-medium transition-colors text-sm"
            >
              <FontAwesomeIcon icon={faUser} />
              Login / Sign Up
            </button>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white text-xl p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#121619]/98 backdrop-blur-lg border-t border-white/10"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? 'bg-white text-[#121619]'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
