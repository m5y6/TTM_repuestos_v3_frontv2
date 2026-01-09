import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const EmployeeRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    // Role 2 is for 'empleado'
    return user && user.rol === 2 ? <Outlet /> : <Navigate to="/login" />;
};

export default EmployeeRoute;
