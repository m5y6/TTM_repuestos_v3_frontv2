import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import '../styles/administrar.css';
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';
import { AuthContext } from '../context/AuthContext';

const Administrar = () => {
    const { user } = useContext(AuthContext);

    const allAdminSections = [
        {
            title: 'Administrar Cuentas',
            description: 'Gestiona los usuarios y sus roles en el sistema.',
            link: '/admin/administrar-cuentas',
            icon: 'fas fa-users-cog',
            roles: [1] // Admin
        },
        {
            title: 'Dashboard de Cotizaciones',
            description: 'Visualiza y gestiona las cotizaciones realizadas.',
            link: '/admin/dashboard-cotizaciones',
            icon: 'fas fa-chart-bar',
            roles: [1] // Admin
        },
        {
            title: 'Ver Productos',
            description: 'Consulta, edita y elimina productos del catálogo.',
            link: '/admin/ver-productos',
            icon: 'fas fa-box-open',
            roles: [1, 2] // Admin and Employee
        },
    ];

    const adminSections = allAdminSections.filter(section => user && section.roles.includes(user.rol));

    return (
        <>
            <Header />
            <div className="admin-dashboard">
                <h1>Panel de Administración</h1>
                <div className="admin-grid">
                    {adminSections.map((section, index) => (
                        <Link to={section.link} key={index} className="admin-card">
                            <div className="admin-card-icon">
                                <i className={section.icon}></i>
                            </div>
                            <div className="admin-card-body">
                                <h3>{section.title}</h3>
                                <p>{section.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Administrar;