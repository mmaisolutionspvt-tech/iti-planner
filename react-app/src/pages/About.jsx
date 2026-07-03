import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="pt-24 min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <img src="/files/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-6 drop-shadow-md" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-display mb-6">About Firstflight Travels</h1>
          
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 text-left">
            <h3 className="text-2xl font-bold text-[#121619] mb-4">Our Story</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Firstflight Travels started with a simple idea: to make travel planning as seamless and enjoyable as the journey itself. 
              We noticed that travelers spent countless hours comparing prices, reading reviews, and trying to piece together itineraries.
              We built Firstflight to bring all of that into one unified platform.
            </p>
            
            <h3 className="text-2xl font-bold text-[#121619] mb-4 mt-8">What We Do</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              We provide end-to-end travel solutions including flight bookings, verified bus travels, curated hotel packages, and 
              AI-driven itinerary planning. By leveraging modern technology, we ensure you get the most optimized routes and the best 
              possible prices.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-100 text-center">
              <div>
                <div className="text-3xl font-bold text-[#FFAA00] mb-1">10K+</div>
                <div className="text-sm text-gray-500 font-medium">Happy Travelers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#FFAA00] mb-1">50+</div>
                <div className="text-sm text-gray-500 font-medium">Destinations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#FFAA00] mb-1">100%</div>
                <div className="text-sm text-gray-500 font-medium">Verified Partners</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#FFAA00] mb-1">24/7</div>
                <div className="text-sm text-gray-500 font-medium">Support</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
