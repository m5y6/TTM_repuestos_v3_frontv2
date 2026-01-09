import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import './AdminLayout.css';

const AdminLayout = () => {
    return (
        <div className="admin-page-container">
            <Header />
            <div className="admin-layout">
                <aside className="admin-sidebar">
                    <nav>
                        <ul>
                            <li><NavLink to="/administrar">Dashboard</NavLink></li>
                            <li><NavLink to="/admin/ver-productos">Ver Productos</NavLink></li>
                            <li><NavLink to="/admin/administrar-cuentas">Administrar Cuentas</NavLink></li>
                            <li><NavLink to="/admin/dashboard-cotizaciones">Cotizaciones</NavLink></li>
                        </ul>
                    </nav>
                </aside>
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminLayout;
