import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Logout from "./components/logout";

import UserDashboard from './routes/userDashboard';

import PublicLayout from "./layouts/PublicLayout";
import HostLayout from "./layouts/HostLayout";

import ProtectedRoute from "./components/protectedRoutes";

function App() {
  return (
    <Routes>
      {/* Public routes with Navbar/Footer */}
      <Route
        element={<PublicLayout />}
      >
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
      </Route>

      {/* Host routes without Navbar/Footer */}
      <Route element={<HostLayout />}>
        <Route 
          path="/user-dashboard/*" 
          element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} 
        />
      </Route>
    </Routes>
  );
}

export default App;
