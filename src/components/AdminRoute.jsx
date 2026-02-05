import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({ user }) => {

    // This component assumes the user is already authenticated
    // because it will be used inside a ProtectedRoute
    if (!user) {
        return <Navigate to="/login" />;
    }

    const isAdmin = user.usuario && user.usuario.rol && user.usuario.rol.nombre === 'ADMIN';

    return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
