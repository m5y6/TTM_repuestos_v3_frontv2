import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CotizacionService from '../../services/CotizacionService';
import ProductoService from '../../services/ProductoService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import '../../styles/administrar.css';
import '../../styles/Dashboard.css';

const DashboardCotizaciones = () => {
    const [productosMasCotizados, setProductosMasCotizados] = useState([]);
    const [productosMasVendidos, setProductosMasVendidos] = useState([]);
    const [filtroFecha, setFiltroFecha] = useState('todos'); // 'todos', 'hoy', 'mes', 'anio'

    const fetchData = useCallback((periodo) => {
        CotizacionService.getAllCotizaciones(periodo)
            .then(response => {
                const cotizaciones = response.data;
                const contadorProductos = {};

                if (Array.isArray(cotizaciones)) {
                    cotizaciones.forEach(cotizacion => {
                        if (cotizacion && cotizacion.producto && cotizacion.producto.nombre) {
                            const nombreProducto = cotizacion.producto.nombre;
                            const cantidad = cotizacion.cantidad;

                            if (contadorProductos[nombreProducto]) {
                                contadorProductos[nombreProducto] += cantidad;
                            } else {
                                contadorProductos[nombreProducto] = cantidad;
                            }
                        }
                    });
                }

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
                setProductosMasCotizados([]);
            });

        ProductoService.getMasVendidos(periodo)
            .then(data => {
                setProductosMasVendidos(data);
            })
            .catch(error => {
                console.error("Error al obtener los productos para la tabla:", error);
                setProductosMasVendidos([]);
            });
    }, []);

    useEffect(() => {
        fetchData(filtroFecha);
    }, [filtroFecha, fetchData]);


    const handleFiltroChange = (nuevoFiltro) => {
        setFiltroFecha(nuevoFiltro);
    };

    return (
        <div className="main-container">
            <Header />
            <div className="admin-container">
                <h1>Dashboard de Cotizaciones</h1>
                
                <div className="filtros-container">
                    <button onClick={() => handleFiltroChange('todos')} className={`filtro-btn ${filtroFecha === 'todos' ? 'active' : ''}`}>Todos</button>
                    <button onClick={() => handleFiltroChange('hoy')} className={`filtro-btn ${filtroFecha === 'hoy' ? 'active' : ''}`}>Hoy</button>
                    <button onClick={() => handleFiltroChange('mes')} className={`filtro-btn ${filtroFecha === 'mes' ? 'active' : ''}`}>Este Mes</button>
                    <button onClick={() => handleFiltroChange('anio')} className={`filtro-btn ${filtroFecha === 'anio' ? 'active' : ''}`}>Este Año</button>
                </div>

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
                <div className="admin-card" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
                    <h3>Top 15 Productos por Cantidad Cotizada</h3>
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Producto</th>
                                <th>Cantidad Total Cotizada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productosMasVendidos && productosMasVendidos.length > 0 ? (
                                productosMasVendidos.map((item, index) => (
                                    <tr key={item.producto.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.producto.nombre}</td>
                                        <td>{item.cantidad}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center' }}>No se encontraron productos más vendidos.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DashboardCotizaciones;
