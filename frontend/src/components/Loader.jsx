import React from 'react';
import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="flex justify-center items-center">
      <motion.div
        className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
    </div>
  );
}
