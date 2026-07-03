import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudSun, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fetchWeather, getPrecautions, REROUTE_SUGGESTIONS } from '../../services/weather';
import useAppStore from '../../stores/useAppStore';

export default function WeatherIcon({ city, className = '' }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const { addToast } = useAppStore();

  const handleClick = async () => {
    if (weather) {
      setShowPanel(!showPanel);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchWeather(city);
      setWeather(data);
      setShowPanel(true);
    } catch (err) {
      addToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const precautions = weather ? getPrecautions(weather.alerts) : [];
  const reroute = REROUTE_SUGGESTIONS[city];
  const hasAlerts = weather?.alerts?.length > 0;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handleClick}
        className={`p-2 rounded-lg transition-all duration-300 ${
          hasAlerts ? 'bg-orange-500/20 text-orange-400 animate-pulse' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
        }`}
        title={`Check weather for ${city}`}
      >
        {loading ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          <FontAwesomeIcon icon={faCloudSun} />
        )}
      </button>

      <AnimatePresence>
        {showPanel && weather && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-80 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">{city} Weather</h3>
                <button onClick={() => setShowPanel(false)} className="text-white/40 hover:text-white text-sm">✕</button>
              </div>

              {/* Daily forecast */}
              <div className="space-y-2 mb-4">
                {weather.dailySummary.slice(0, 4).map((day, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-white/5 rounded-lg p-2">
                    <span className="text-white/70 w-20">{day.date}</span>
                    <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt="" className="w-8 h-8" />
                    <span className="text-white">{day.minTemp}° - {day.maxTemp}°</span>
                    <span className={`${day.maxRain > 50 ? 'text-blue-400' : 'text-white/50'}`}>💧{day.maxRain}%</span>
                  </div>
                ))}
              </div>

              {/* Precautions */}
              {precautions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-yellow-400 text-xs font-semibold mb-2 uppercase tracking-wider">⚠️ Precautions</h4>
                  <div className="space-y-1">
                    {precautions.map((p, i) => (
                      <div key={i} className={`text-xs p-2 rounded-lg ${
                        p.priority === 'high' ? 'bg-red-500/10 text-red-300' : 'bg-yellow-500/10 text-yellow-300'
                      }`}>
                        {p.icon} {p.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reroute suggestion */}
              {hasAlerts && reroute && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-emerald-400 text-xs font-semibold mb-1">🔄 Smart Re-routing</p>
                  <p className="text-white/70 text-xs">{reroute.reason}. Consider:</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {reroute.alternatives.map(alt => (
                      <span key={alt} className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">{alt}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
