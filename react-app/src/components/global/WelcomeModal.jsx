import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCloudSun, faBus, faMap } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../../stores/useAppStore';

export default function WelcomeModal() {
  const { welcomed, setWelcomed } = useAppStore();
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!welcomed) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, [welcomed]);

  const handleDismiss = () => {
    setShow(false);
    setWelcomed();
  };

  const handlePlan = () => {
    handleDismiss();
    navigate('/schedule-trip');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="bg-gradient-to-br from-[#121619] to-[#1e2429] rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/10"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-5xl mb-4"
              >
                🙏
              </motion.div>
              <h2 className="text-white text-2xl font-bold mb-2">Namaste! 👋</h2>
              <p className="text-white/80 mb-6">Plan trips in 60 seconds with AI.</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: faCloudSun, text: 'Live weather checks', color: 'text-yellow-400' },
                  { icon: faBus, text: 'Verified buses', color: 'text-emerald-400' },
                  { icon: faMap, text: 'Living Map', color: 'text-blue-400' },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5"
                  >
                    <FontAwesomeIcon icon={feature.icon} className={`text-xl ${feature.color}`} />
                    <span className="text-white/70 text-xs text-center">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white/5 rounded-xl p-3 mb-6">
                <p className="text-emerald-400 text-sm font-medium">
                  🎉 Get +10 TravelCoins on your first review!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePlan}
                  className="flex-1 bg-white text-[#121619] font-semibold py-3 rounded-xl hover:bg-white/90 transition-all hover:shadow-lg hover:shadow-white/20 flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faPaperPlane} /> Plan Your Trip
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
