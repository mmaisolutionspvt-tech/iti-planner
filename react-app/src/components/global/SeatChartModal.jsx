import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCouch } from '@fortawesome/free-solid-svg-icons';

export default function SeatChartModal({ isOpen, onClose, type, maxSeats = 1, onConfirm }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedSeats([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rows = type === 'flight' ? 15 : 8;
  const cols = type === 'flight' ? ['A', 'B', 'C', 'D', 'E', 'F'] : ['A', 'B', 'C', 'D'];
  const aisleIndex = type === 'flight' ? 3 : 2;

  const handleSeatClick = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length < maxSeats) {
        setSelectedSeats([...selectedSeats, seatId]);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-[#1a1f24] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#121619]">
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Select Your Seats
              </h2>
              <p className="text-white/60 text-sm mt-1">
                Choose {maxSeats} seat{maxSeats > 1 ? 's' : ''} for your journey
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
            <div className="max-w-sm mx-auto">
              
              {/* Cockpit / Driver area visual */}
              <div className="flex justify-center mb-10">
                <div className="w-32 h-10 border-t-4 border-l-4 border-r-4 border-white/20 rounded-t-full bg-white/5 flex items-center justify-center">
                  <span className="text-xs text-white/30 uppercase tracking-widest font-bold">Front</span>
                </div>
              </div>

              {/* Seats Grid */}
              <div className="space-y-4">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-2 items-center">
                    {/* Row Number */}
                    <div className="w-6 text-center text-white/30 text-xs font-bold mr-2">
                      {rowIndex + 1}
                    </div>

                    <div className="flex gap-2">
                      {cols.map((col, colIndex) => {
                        const seatId = `${rowIndex + 1}${col}`;
                        const isSelected = selectedSeats.includes(seatId);
                        // Mock random booked seats (based on string hash)
                        const isBooked = (seatId.charCodeAt(0) + seatId.charCodeAt(1)) % 5 === 0;

                        return (
                          <div key={seatId} className="flex">
                            {colIndex === aisleIndex && (
                              <div className="w-6" /> // Aisle gap
                            )}
                            <button
                              disabled={isBooked}
                              onClick={() => handleSeatClick(seatId)}
                              className={`
                                w-10 h-10 rounded-t-lg rounded-b-sm flex items-center justify-center transition-all relative group
                                ${isBooked 
                                  ? 'bg-white/10 text-white/20 cursor-not-allowed' 
                                  : isSelected 
                                    ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                                    : 'bg-white/20 hover:bg-white/30 text-white/70'
                                }
                              `}
                              title={seatId}
                            >
                              <FontAwesomeIcon icon={faCouch} className="text-sm" />
                              
                              {/* Tooltip */}
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {isBooked ? 'Booked' : seatId}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-[#121619] flex items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <div className="w-4 h-4 rounded-t bg-white/20"></div> Available
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <div className="w-4 h-4 rounded-t bg-emerald-500"></div> Selected
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <div className="w-4 h-4 rounded-t bg-white/10"></div> Booked
              </div>
            </div>
            <button
              onClick={() => onConfirm(selectedSeats)}
              disabled={selectedSeats.length !== maxSeats}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg"
            >
              {selectedSeats.length === maxSeats ? 'Confirm Seats' : `Select ${maxSeats - selectedSeats.length} More`}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
