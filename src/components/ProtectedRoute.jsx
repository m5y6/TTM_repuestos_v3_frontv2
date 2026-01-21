import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        // You might want to show a loading spinner here
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Check if the user has the required role
    const hasRequiredRole = user.usuario && user.usuario.rol && (user.usuario.rol.nombre === 'ADMIN' || user.usuario.rol.nombre === 'EMPLEADO');

    return hasRequiredRole ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
