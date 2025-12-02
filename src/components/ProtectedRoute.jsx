import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        // You might want to show a loading spinner here
        return <div>Loading...</div>;
    }

    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
