import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/administrar.css';
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';

const Administrar = () => {
    const adminSections = [
        {
            title: 'Administrar Cuentas',
            description: 'Gestiona los usuarios y sus roles en el sistema.',
            link: '/admin/administrar-cuentas',
            icon: 'fas fa-users-cog',
        },
        {
            title: 'Dashboard de Cotizaciones',
            description: 'Visualiza y gestiona las cotizaciones realizadas.',
            link: '/admin/dashboard-cotizaciones',
            icon: 'fas fa-chart-bar',
        },
        {
            title: 'Ver Productos',
            description: 'Consulta, edita y elimina productos del catálogo.',
            link: '/admin/ver-productos',
            icon: 'fas fa-box-open',
        },
    ];

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