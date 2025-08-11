import React  from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Logout from "./components/Logout";
import Quiz from "./pages/Quiz";
import Verification from "./pages//Verification";
import About from "./pages/About";
import Result from "./pages/Results";
import NotFound from "./pages/NotFound";
import Loader from './components/Loader';
import VerifyEmail from "./components/VerifyEmail";



import UserDashboard from './routes/UserDashboard';
// import AdminDashboard from './routes/AdminDashboard';

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />

    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/about" element={<About />} />   
        <Route path="/load" element={<Loader />} />       
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/result" element={<Result />} />
      </Route>

      {/* Host routes without Navbar/Footer */}
      { <Route element={<DashboardLayout />}>
        <Route 
          path="/user-dashboard/*" 
          element={<ProtectedRoute allowedRoles={['teacher']}><UserDashboard /></ProtectedRoute>} 
        />

        {/* <Route 
          path="/user-dashboard/*" 
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
        /> */}
      </Route> }

      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}

export default App;
