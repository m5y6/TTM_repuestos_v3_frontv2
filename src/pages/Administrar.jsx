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
            roles: ['ADMIN'] // Admin
        },
        {
            title: 'Dashboard de Cotizaciones',
            description: 'Visualiza y gestiona las cotizaciones realizadas.',
            link: '/admin/dashboard-cotizaciones',
            icon: 'fas fa-chart-bar',
            roles: ['ADMIN'] // Admin
        },
        {
            title: 'Ver Productos',
            description: 'Consulta, edita y elimina productos del catálogo.',
            link: '/admin/ver-productos',
            icon: 'fas fa-box-open',
            roles: ['ADMIN', 'EMPLEADO'] // Admin and Employee
        },
        {
            title: 'Administrar Categorías',
            description: 'Gestiona las categorías de productos.',
            link: '/admin/administrar-categorias',
            icon: 'fas fa-tags',
            roles: ['ADMIN'] // Admin
        },
        {
            title: 'Administrar Marcas',
            description: 'Gestiona las marcas de productos.',
            link: '/admin/administrar-marcas',
            icon: 'fas fa-copyright',
            roles: ['ADMIN'] // Admin
        },
        {
            title: 'Historial',
            description: 'Revisa el historial de cambios en el sistema.',
            link: '/historial',
            icon: 'fas fa-history',
            roles: ['ADMIN'] // Admin
        },
    ];

    const adminSections = allAdminSections.filter(section => user && user.usuario && user.usuario.rol && section.roles.includes(user.usuario.rol.nombre));

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