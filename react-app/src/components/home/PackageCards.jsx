import { motion } from 'framer-motion';

const packages = [
  { image: '/files/p1.jpg', name: 'Bronze', price: '9,999', features: ['2 Star Hotel', '5 Nights Stay', 'Free photo Session', 'Friendly Tour Guide', '24/7 Customer Help Center'] },
  { image: '/files/p2.jpg', name: 'Silver', price: '19,999', features: ['3 Star Hotel', '7 Nights Stay', 'Free photo Session', 'Friendly Tour Guide', '24/7 Customer Help Center'] },
  { image: '/files/p3.jpg', name: 'Gold', price: '29,999', features: ['4 Star Hotel', '10 Nights Stay', 'Breakfast and Dinner', 'Free photo Session', 'Friendly Tour Guide', '24/7 Customer Help Center'] },
  { image: '/files/p4.jpg', name: 'Platinum', price: '39,999', features: ['5 Star Hotel', '14 Nights Stay', 'Breakfast, Lunch and Dinner', 'Bonfire', 'Free photo Session', 'Friendly Tour Guide', '24/7 Customer Help Center'] },
];

export default function PackageCards() {
  return (
    <section className="py-20 px-4" id="packages">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
        >
          Packages
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-3xl h-[400px] cursor-pointer">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110 brightness-95"
                />
                <h3 className="absolute top-4 right-5 text-white text-2xl font-semibold drop-shadow-lg">
                  Rs.{pkg.price}/-
                </h3>
              </div>
              <div className="pt-4 pb-8">
                <h4 className="text-2xl font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                <ul className="space-y-1">
                  {pkg.features.map((f, j) => (
                    <li key={j} className="text-gray-500 text-sm list-disc ml-4">{f}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
