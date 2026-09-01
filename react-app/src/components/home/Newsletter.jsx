import { useState } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../../stores/useAppStore';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const { addToast } = useAppStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      addToast({ type: 'success', title: 'Subscribed!', message: 'You will receive weekly offers and updates.' });
      setEmail('');
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Newsletter</h2>
          <p className="text-gray-500 mt-2">Subscribe to get offers and latest<br />updates every week!</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="relative w-full max-w-lg"
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            className="w-full px-6 py-5 pr-36 rounded-full text-gray-900 outline-none shadow-lg shadow-gray-200/50 border border-gray-100"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bg-[#121619] text-white px-6 py-3.5 rounded-full font-medium hover:bg-[#121619]/90 transition-all border-2 border-transparent hover:border-[#121619] hover:bg-white hover:text-[#121619]"
          >
            Subscribe
          </button>
        </motion.form>
      </div>
    </section>
  );
}
