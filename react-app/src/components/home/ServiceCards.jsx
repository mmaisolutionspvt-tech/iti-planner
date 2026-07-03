import { motion } from 'framer-motion';

const services = [
  { image: '/files/1a.jpg', title: 'Flight Services', desc: 'Arrival and Departure' },
  { image: '/files/2a.jpg', title: 'Food Services', desc: 'Catering' },
  { image: '/files/3a.jpg', title: 'Travel Services', desc: 'Pick-up/drop' },
  { image: '/files/4a.jpg', title: 'Hotel Services', desc: 'Check-in/out' },
];

export default function ServiceCards() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
        >
          We have the best services available for you!
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ x: 3, boxShadow: '5px 20px 50px rgba(78,78,78,0.1)' }}
              className="border border-gray-200 rounded-xl p-8 text-center cursor-pointer transition-all duration-500 hover:border-transparent"
            >
              <img src={service.image} alt={service.title} className="w-24 h-24 mx-auto mb-4 object-contain" />
              <h4 className="text-lg font-semibold text-gray-900 mb-1">{service.title}</h4>
              <p className="text-gray-500 text-sm">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
