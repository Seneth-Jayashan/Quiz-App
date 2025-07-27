import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/signin" />;
  }

  try {
    const userRole = JSON.parse(atob(token.split('.')[1])).role;

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/logout" />;
    }

    return children;
  } catch (error) {
    console.error('Invalid token:', error);
    return <Navigate to="/signin" />;
  }
};

export default ProtectedRoute;
