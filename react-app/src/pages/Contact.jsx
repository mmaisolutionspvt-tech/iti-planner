import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export default function Contact() {
  return (
    <div className="pt-24 min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <img src="/files/contact.png" alt="Contact Us" className="w-full max-w-md mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-display mb-6">Get in Touch</h1>
          <p className="text-gray-500 text-lg mb-10">
            Have questions about a trip or need help with a booking? Our team is available 24/7 to assist you.
          </p>

          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] focus:ring-1 focus:ring-[#121619] outline-none" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] focus:ring-1 focus:ring-[#121619] outline-none" placeholder="Your Email" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#121619] focus:ring-1 focus:ring-[#121619] outline-none resize-none" placeholder="How can we help you?"></textarea>
            </div>
            
            <button type="submit" className="bg-[#121619] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1e2429] transition-colors shadow-lg w-full md:w-auto">
              Send Message
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] group-hover:scale-110">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <p className="text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600">Email</p>
              <p className="text-xs text-gray-500 mt-1">support@firstflight.com</p>
            </div>
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] group-hover:scale-110">
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <p className="text-sm font-medium text-gray-900 transition-colors group-hover:text-emerald-600">Phone</p>
              <p className="text-xs text-gray-500 mt-1">+91 98765 43210</p>
            </div>
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] group-hover:scale-110">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <p className="text-sm font-medium text-gray-900 transition-colors group-hover:text-purple-600">Office</p>
              <p className="text-xs text-gray-500 mt-1">New Delhi, India</p>
            </div>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
