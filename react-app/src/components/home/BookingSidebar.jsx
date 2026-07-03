import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBus, faPlane, faHotel, faMapLocationDot, faCalendarDays, faMagnifyingGlass, faUsers } from '@fortawesome/free-solid-svg-icons';

export default function BookingSidebar({ onSearch }) {
  const [activeTab, setActiveTab] = useState('bus');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    fromDate: '',
    toDate: '',
    passengers: 1
  });

  const tabs = [
    { id: 'bus', icon: faBus, label: 'Bus' },
    { id: 'flight', icon: faPlane, label: 'Flight' },
    { id: 'hotels', icon: faHotel, label: 'Hotels' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ type: activeTab, ...formData });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -100 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        x: 0,
        boxShadow: ["0px 0px 0px 0px rgba(234, 255, 0, 0)", "0px 0px 20px 5px rgba(234, 255, 0, 0.6)", "0px 0px 10px 2px rgba(234, 255, 0, 0.3)"]
      }}
      transition={{ 
        duration: 0.8, 
        type: "spring",
        boxShadow: { duration: 2, repeat: Infinity, repeatType: "reverse" } 
      }}
      className="absolute top-32 left-4 md:left-12 w-[90%] max-w-[380px] bg-[#121619]/95 backdrop-blur-xl border border-white/10 rounded-2xl z-40 p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-white tracking-wide">Where to next?</h2>
      </div>

      <div className="flex bg-[#1e2429] p-1 rounded-xl mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#D4B15A] text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <FontAwesomeIcon icon={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab !== 'hotels' && (
          <div>
            <div className="relative">
              <FontAwesomeIcon icon={faMapLocationDot} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4B15A]" />
              <input
                type="text"
                required
                placeholder="Origin City"
                value={formData.from}
                onChange={e => setFormData({ ...formData, from: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-[#1e2429] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#D4B15A] focus:ring-1 focus:ring-[#D4B15A] outline-none transition-all"
              />
            </div>
          </div>
        )}

        <div>
          <div className="relative">
            <FontAwesomeIcon icon={faMapLocationDot} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4B15A]" />
            <input
              type="text"
              required
              placeholder="Destination City"
              value={formData.to}
              onChange={e => setFormData({ ...formData, to: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-[#1e2429] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#D4B15A] focus:ring-1 focus:ring-[#D4B15A] outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FontAwesomeIcon icon={faCalendarDays} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4B15A] text-sm" />
            <input
              type="date"
              required
              value={formData.fromDate}
              onChange={e => setFormData({ ...formData, fromDate: e.target.value })}
              className="w-full pl-9 pr-3 py-3 bg-[#1e2429] border border-white/10 rounded-xl text-white focus:border-[#D4B15A] focus:ring-1 focus:ring-[#D4B15A] outline-none transition-all text-sm [color-scheme:dark]"
            />
          </div>
          <div className="relative">
            <FontAwesomeIcon icon={faUsers} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4B15A] text-sm" />
            <select
              value={formData.passengers}
              onChange={e => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
              className="w-full pl-9 pr-3 py-3 bg-[#1e2429] border border-white/10 rounded-xl text-white focus:border-[#D4B15A] focus:ring-1 focus:ring-[#D4B15A] outline-none transition-all text-sm appearance-none"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-[#D4B15A] hover:bg-[#b89542] text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(212,177,90,0.3)] hover:shadow-[0_0_25px_rgba(212,177,90,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          Search {activeTab === 'hotels' ? 'Hotels' : activeTab === 'bus' ? 'Buses' : 'Flights'}
        </button>
      </form>
    </motion.div>
  );
}
