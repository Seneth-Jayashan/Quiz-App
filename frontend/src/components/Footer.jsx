import React from "react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-transparent sticky bottom-0 z-50 w-full transition-colors duration-300 dark:text-white py-2"
    >
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm select-none">
          &copy; {new Date().getFullYear()} Menti Quiz. All rights reserved.
        </p>
        <p className="mt-2 text-xs select-none">
          Built with ❤️ by S JAY Web Solutions (Pvt) Ltd.
        </p>
      </div>
    </motion.footer>
  );
}
