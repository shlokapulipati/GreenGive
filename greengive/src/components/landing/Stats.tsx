'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '£142,800', label: 'Total prizes awarded' },
  { value: '3,840', label: 'Active subscribers' },
  { value: '£28,600', label: 'Donated to charities' },
  { value: '47', label: 'Charities supported' },
];

export default function Stats() {
  return (
    <section className="py-12 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-4xl md:text-5xl font-syne font-bold text-gold">
                {stat.value}
              </span>
              <span className="text-sm font-dm text-gray-400 font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
