import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faXmark, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function ReviewModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setRating(0);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[#121619] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            {submitted ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="text-[#FFAA00] text-6xl mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-white/60">Your feedback helps us improve Firstflight Travels.</p>
              </motion.div>
            ) : (
              <div className="text-center">
                <h3 className="text-2xl font-display font-bold text-white mb-2">Rate Your Experience</h3>
                <p className="text-white/60 mb-8 text-sm">How was your booking process with us?</p>
                
                {/* 5-Star Matrix */}
                <div className="flex justify-center gap-2 mb-8 flex-row-reverse">
                  {[5, 4, 3, 2, 1].map(num => (
                    <button
                      key={num}
                      type="button"
                      onMouseEnter={() => setHovered(num)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(num)}
                      className={`text-4xl transition-all duration-200 peer ${
                        (hovered || rating) >= num ? 'text-[#FFAA00] scale-110 drop-shadow-[0_0_8px_rgba(255,170,0,0.5)]' : 'text-white/10 hover:text-[#FFAA00]/50'
                      } hover:~peer:text-[#FFAA00]`}
                    >
                      <FontAwesomeIcon icon={faStar} />
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  <textarea
                    placeholder="Tell us more about your experience (optional)"
                    className="w-full bg-[#1e2429] border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:border-[#FFAA00] focus:ring-1 focus:ring-[#FFAA00] outline-none transition-all resize-none h-24 mb-6"
                  ></textarea>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      type="submit"
                      disabled={!rating}
                      className={`flex-[2] px-4 py-3 rounded-xl font-bold shadow-lg transition-all ${
                        rating 
                          ? 'bg-[#FFAA00] hover:bg-[#FFBC1A] text-[#121619] hover:scale-[1.02]' 
                          : 'bg-white/10 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
