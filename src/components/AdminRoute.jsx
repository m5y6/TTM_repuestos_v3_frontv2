import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        // You might want to show a loading spinner here
        return <div>Loading...</div>;
    }

    return user && (user.rol === 1 || user.rol === 2) ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;