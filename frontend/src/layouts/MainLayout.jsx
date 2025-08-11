import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PublicLayout() {
  return (
    <>
      <header className="absolute w-full pt-4">
        <Navbar />
      </header>

      <main className="relative min-h-screen flex flex-col justify-center items-center pt-32 md:pt-20 bg-gradient-to-t from-blue-300 to-blue-100 px-4 dark:bg-gradient-to-t dark:from-gray-900 dark:to-gray-800">
        <Outlet />
      </main>
      <footer className="bg-gradient-to-r from-blue-300 to-blue-100 px-4 dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Footer/>
      </footer>
    </>
  );
}
