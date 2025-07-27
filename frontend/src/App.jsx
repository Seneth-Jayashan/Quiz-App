import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/host/Dashboard";
import Account from "./pages/host/Account";
import Sessions from "./pages/host/Sessions";

import CreateQuestion from "./components/CreateQuestion";
import CreateSession from "./components/CreateSession";

import PublicLayout from "./layouts/PublicLayout";
import HostLayout from "./layouts/HostLayout";

function App() {
  return (
    <Routes>
      {/* Public routes with Navbar/Footer */}
      <Route
        element={<PublicLayout />}
      >
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Host routes without Navbar/Footer */}
      <Route element={<HostLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/session" element={<CreateSession />} />
        <Route path="/question" element={<CreateQuestion />} />
        <Route path="/sessions" element={<Sessions />} />
      </Route>
    </Routes>
  );
}

export default App;
