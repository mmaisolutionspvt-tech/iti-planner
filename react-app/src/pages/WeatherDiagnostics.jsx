import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet, faSun, faTriangleExclamation, faLocationDot, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function WeatherDiagnostics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Hardcode lat/lng for Delhi for demo, or read from query params
  const lat = 28.6139;
  const lng = 77.2090;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Open-Meteo API (no key required)
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&current_weather=true&timezone=auto`);
        const result = await res.json();
        
        // Format for Recharts
        const chartData = result.daily.time.map((date, idx) => ({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          maxTemp: result.daily.temperature_2m_max[idx],
          minTemp: result.daily.temperature_2m_min[idx],
        }));

        setData({
          current: result.current_weather,
          daily: result.daily,
          chartData
        });
      } catch (err) {
        console.error("Failed to fetch weather", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFAA00]"></div>
      </div>
    );
  }

  const currentUV = data?.daily?.uv_index_max[0] || 0;
  const precipProb = data?.daily?.precipitation_probability_max[0] || 0;

  return (
    <div className="pt-24 min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#121619] rounded-xl flex items-center justify-center text-[#FFAA00] text-xl shadow-lg">
              <FontAwesomeIcon icon={faLocationDot} />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-[#121619]">Weather Diagnostics</h1>
              <p className="text-gray-500 font-medium">Real-time telemetry & forecasting</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate(`/select-hotel?${searchParams.toString()}`)}
            className="flex items-center gap-2 bg-[#FFAA00] hover:bg-[#FFBC1A] text-[#121619] px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Proceed to Booking
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        {/* Top: Telemetry Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#121619] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-white/5 text-8xl group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faDroplet} />
            </div>
            <h3 className="text-white/60 font-medium mb-1">Humidity / Precip</h3>
            <p className="text-4xl font-bold text-white mb-2">{precipProb}<span className="text-xl text-[#FFAA00]">%</span></p>
            <p className="text-sm text-[#FFAA00]">Max precipitation probability today</p>
          </div>

          <div className="bg-[#121619] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-white/5 text-8xl group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faSun} />
            </div>
            <h3 className="text-white/60 font-medium mb-1">UV Index</h3>
            <p className="text-4xl font-bold text-white mb-2">{currentUV}</p>
            <p className="text-sm text-[#FFAA00]">Peak ultraviolet radiation exposure</p>
          </div>

          <div className="bg-[#121619] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-white/5 text-8xl group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <h3 className="text-white/60 font-medium mb-1">Inclement Weather Risk</h3>
            <p className="text-4xl font-bold text-white mb-2">
              {precipProb > 50 ? 'High' : precipProb > 20 ? 'Moderate' : 'Low'}
            </p>
            <p className="text-sm text-[#FFAA00]">Based on current atmospheric data</p>
          </div>
        </div>

        {/* Middle: Analytics Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-[#121619] mb-6">7-Day Temperature Analytics</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} unit="°" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121619', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#FFAA00' }}
                />
                <Line type="monotone" dataKey="maxTemp" name="Max Temp" stroke="#FFAA00" strokeWidth={4} dot={{ r: 6, fill: '#121619', stroke: '#FFAA00', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="minTemp" name="Min Temp" stroke="#4b5563" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom: Safety Advisories */}
        <div className="bg-[#FFAA00]/10 border border-[#FFAA00]/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-[#121619] mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-[#FFAA00]" />
            Actionable Precautionary Measures
          </h3>
          <div className="space-y-3">
            {currentUV > 6 && (
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[#FFAA00] mt-2 shrink-0" />
                <p className="text-gray-700"><strong>High UV Alert:</strong> Sun exposure should be strictly limited between 10 AM and 4 PM. Apply SPF 50+ sunscreen every 2 hours.</p>
              </div>
            )}
            {precipProb > 50 && (
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[#FFAA00] mt-2 shrink-0" />
                <p className="text-gray-700"><strong>Precipitation Warning:</strong> High likelihood of rain. Ensure travel plans include buffer times for traffic delays and carry water-resistant gear.</p>
              </div>
            )}
            {data.current.temperature < 15 && (
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[#FFAA00] mt-2 shrink-0" />
                <p className="text-gray-700"><strong>Cold Temperature:</strong> Current temperatures are dropping. Pack thermal layers and adequate winter clothing for evening outings.</p>
              </div>
            )}
            {data.current.temperature >= 15 && precipProb <= 50 && currentUV <= 6 && (
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                <p className="text-gray-700"><strong>Clear Conditions:</strong> Weather conditions are optimal for outdoor activities. Standard travel precautions apply.</p>
              </div>
            )}
          </div>
        </div>

        {/* Proceed to Booking Action */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => navigate(`/booking-grid?${searchParams.toString()}`)}
            className="flex items-center gap-3 bg-[#121619] hover:bg-[#1e2429] text-[#FFAA00] font-bold px-10 py-4 rounded-full shadow-2xl transition-all hover:scale-105"
          >
            <span>Proceed to View Options</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

      </div>
    </div>
  );
}
