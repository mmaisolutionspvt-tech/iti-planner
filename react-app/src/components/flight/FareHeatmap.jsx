import { motion } from 'framer-motion';

export default function FareHeatmap({ from, to }) {
  // Mock data for a calendar heatmap representation of prices
  const days = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const basePrice = 4500;
    const variation = Math.random() * 3000 - 1000;
    return {
      date,
      price: Math.round(basePrice + variation),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate()
    };
  });

  const getHeatColor = (price) => {
    if (price < 4000) return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
    if (price < 6000) return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
  };

  if (!from || !to) return null;

  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Fare Calendar Heatmap</h4>
      
      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
        {days.map((day, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={i}
            className={`min-w-[80px] p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-colors ${getHeatColor(day.price)}`}
          >
            <span className="text-xs font-semibold uppercase opacity-70">{day.dayName}</span>
            <span className="text-xl font-bold my-1">{day.dayNum}</span>
            <span className="text-xs font-medium">₹{day.price}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 justify-end">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-200"></div> Cheapest</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-yellow-200"></div> Average</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-200"></div> Expensive</div>
      </div>
    </div>
  );
}
