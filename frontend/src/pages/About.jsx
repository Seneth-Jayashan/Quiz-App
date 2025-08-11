import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function About() {
  const navigate = useNavigate();

  // Fade-in animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Helper to open external URLs safely
  function openExternal(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto px-6 py-12 text-gray-900 dark:text-gray-100"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center mb-8">
        <img src="src/assets/logo.png" alt="Menti Quiz App Logo" className="h-80 w-auto rounded-3xl shadow-md " />
      </div>

      <h1 className="text-4xl font-bold mb-6 text-center">About Menti Quiz App</h1>
      <p className="mb-6">
        Menti Quiz App is a dynamic platform focused exclusively on <strong>live quizzes</strong> that enable instant interaction and engagement.
        It offers hosts the ability to conduct real-time quizzes with participants joining seamlessly via unique codes or links.
        The app emphasizes <strong>easy-to-understand graphical results</strong>, allowing quiz hosts to visualize responses instantly with charts and graphs.
        This makes Menti Quiz App perfect for classrooms, workshops, meetings, and events where live feedback is essential.
      </p>

      <motion.section
        className="mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <h2 className="text-2xl font-semibold mb-4">About the Developer</h2>
        <p className="mb-4">
          Seneth Jayashan is a dedicated software developer with a passion for crafting intuitive web applications that enhance user experience.
          With a strong background in frontend and backend development, Seneth focuses on creating solutions that are both powerful and user-friendly.
          As the founder of <strong>S JAY Web Solutions Pvt Ltd</strong>, he leads a team committed to innovation and quality in software design.
          Outside of coding, Seneth enjoys exploring new technologies, contributing to open-source projects, and mentoring aspiring developers.
        </p>
      </motion.section>

      <motion.section
        className="mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <h2 className="text-2xl font-semibold mb-4">About S JAY Web Solutions Pvt Ltd</h2>
        <p className="mb-4">
          S JAY Web Solutions Pvt Ltd is a technology company specializing in delivering high-quality software solutions tailored to client needs.
          The company thrives on creativity, reliability, and performance, helping businesses and individuals leverage technology to achieve their goals.
          Menti Quiz App is one of the many innovative products developed under its umbrella.
        </p>
      </motion.section>

      <motion.section
        className="mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <h2 className="text-2xl font-semibold mb-4">Find Me Online</h2>
        <div className="flex flex-wrap gap-6">
          <button
            onClick={() => openExternal('https://sjaywebsolutions.lk')}
            className="text-blue-600 dark:text-cyan-500  focus:outline-none"
          >
            Personal Website
          </button>
          <button
            onClick={() => openExternal('https://github.com/seneth-jayashan')}
            className="text-gray-800 dark:text-blue-300 dark:hover:text-blue-600 hover:text-black focus:outline-none"
          >
            GitHub
          </button>
          <button
            onClick={() => openExternal('https://linkedin.com/in/seneth-jayashan')}
            className="text-blue-700 dark:text-cyan-500  focus:outline-none"
          >
            LinkedIn
          </button>
          
        </div>
      </motion.section>
    </motion.div>
  );
}
