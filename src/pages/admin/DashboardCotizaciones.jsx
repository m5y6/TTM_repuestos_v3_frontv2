import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CotizacionService from '../../services/CotizacionService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import '../../styles/administrar.css';

const DashboardCotizaciones = () => {
    const [productosMasCotizados, setProductosMasCotizados] = useState([]);

    useEffect(() => {
        CotizacionService.getAllCotizaciones()
            .then(response => {
                const cotizaciones = response.data;
                const contadorProductos = {};

                cotizaciones.forEach(cotizacion => {
                    cotizacion.productos.forEach(producto => {
                        if (contadorProductos[producto.nombre]) {
                            contadorProductos[producto.nombre] += producto.cantidad;
                        } else {
                            contadorProductos[producto.nombre] = producto.cantidad;
                        }
                    });
                });

                const productosOrdenados = Object.keys(contadorProductos)
                    .map(nombre => ({
                        nombre,
                        cantidad: contadorProductos[nombre]
                    }))
                    .sort((a, b) => b.cantidad - a.cantidad)
                    .slice(0, 15);

                setProductosMasCotizados(productosOrdenados);
            })
            .catch(error => {
                console.error("Error al obtener las cotizaciones:", error);
            });
    }, []);

    return (
        <>
            <Header />
            <div className="admin-container">
                <h1>Dashboard de Cotizaciones</h1>
                <div className="admin-card" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <h3>Top 15 Productos Más Cotizados</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={productosMasCotizados}
                            margin={{
                                top: 20, right: 30, left: 20, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad Cotizada" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default DashboardCotizaciones;
