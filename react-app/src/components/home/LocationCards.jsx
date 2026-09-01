import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const locations = [
  { img: '/files/l1.jpg', country: 'India', city: 'Kashmir', id: 'kashmir' },
  { img: '/files/l2.jpg', country: 'Turkey', city: 'Istanbul', id: 'istanbul' },
  { img: '/files/l3.jpg', country: 'France', city: 'Paris', id: 'paris' },
  { img: '/files/l4.jpg', country: 'Indonesia', city: 'Bali', id: 'bali' },
  { img: '/files/l5.jpg', country: 'United Arab Emirates', city: 'Dubai', id: 'dubai' },
  { img: '/files/l6.jpg', country: 'Switzerland', city: 'Geneva', id: 'geneva' },
  { img: '/files/l7.jpg', country: 'Andaman & Nicobar', city: 'Port Blair', id: 'port-blair' },
  { img: '/files/l8.jpg', country: 'Italy', city: 'Rome', id: 'rome' },
];

export default function LocationCards() {
  return (
    <section className="py-20 px-4" id="locations">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
        >
          Locations
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {locations.map((loc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/locations?country=${encodeURIComponent(loc.country)}`} className="block group">
                <div className="relative overflow-hidden rounded-3xl h-[400px]">
                  <img
                    src={loc.img}
                    alt={loc.city}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-5">
                    <h5 className="text-white font-medium text-xl">{loc.country}</h5>
                    <p className="text-white/80">{loc.city}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
