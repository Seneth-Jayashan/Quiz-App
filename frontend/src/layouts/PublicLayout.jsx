import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
