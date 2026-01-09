import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ProductoService from '../services/ProductoService';
import { AuthContext } from '../context/AuthContext';
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';
import '../styles/catalogo.css'; // Reutilizamos estilos, se pueden crear unos nuevos

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [filtros, setFiltros] = useState({
        busqueda: ''
    });

    useEffect(() => {
        ProductoService.getProductos()
            .then(response => {
                const productosApi = response.data.map(p => ({
                    ...p,
                    imagen: p.imagen_url || '/img/placeholder.jpg'
                }));
                setProductos(productosApi);
                setProductosFiltrados(productosApi);
            })
            .catch(error => {
                console.error("Error fetching productos:", error);
            });
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [filtros, productos]);

    const aplicarFiltros = () => {
        let resultado = [...productos];
        const normalizeString = (str) =>
            str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

        if (filtros.busqueda.trim() !== '') {
            const termino = normalizeString(filtros.busqueda);
            resultado = resultado.filter(producto =>
                normalizeString(producto.nombre).includes(termino) ||
                (producto.descripcion && normalizeString(producto.descripcion).includes(termino)) ||
                normalizeString(producto.categoria).includes(termino) ||
                (producto.oem && normalizeString(producto.oem).includes(termino))
            );
        }
        setProductosFiltrados(resultado);
    };

    const handleBusquedaChange = (e) => {
        setFiltros(prev => ({
            ...prev,
            busqueda: e.target.value
        }));
    };

    const deleteProducto = (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            ProductoService.deleteProductos(id)
                .then(() => {
                    setProductos(productos.filter(p => p.id !== id));
                })
                .catch(error => {
                    console.error("Error deleting producto:", error);
                    alert("Error al eliminar el producto.");
                });
        }
    };


    return (
        <>
            <Header />
            <main className="admin-dashboard-container" style={{ padding: "2rem" }}>
                <h1>Panel de Administración</h1>
                <p>Bienvenido, {user?.nombre || 'Admin'}.</p>

                <div className="catalogo-container">
                    <div className="buscador-container" style={{marginBottom: "2rem"}}>
                        <div className="buscador-wrapper">
                            <div className="buscador-input-container">
                                <svg className="buscador-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                                <input
                                    type="text"
                                    className="buscador-input"
                                    placeholder="Buscar productos (nombre, descripción, categoría)..."
                                    autoComplete="off"
                                    value={filtros.busqueda}
                                    onChange={handleBusquedaChange}
                                />
                                {filtros.busqueda && (
                                    <button
                                        type="button"
                                        className="limpiar-buscador"
                                        onClick={() => setFiltros(prev => ({ ...prev, busqueda: '' }))}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="admin-productos-tabla">
                        <table>
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Precio</th>
                                    <th>Categoría</th>
                                    <th>OEM</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosFiltrados.map((producto) => (
                                    <tr key={producto.id}>
                                        <td>
                                            <img
                                                src={producto.imagen}
                                                alt={producto.nombre}
                                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                            />
                                        </td>
                                        <td>{producto.nombre}</td>
                                        <td>{producto.descripcion}</td>
                                        <td>{`$${producto.precio.toLocaleString('es-CL')}`}</td>
                                        <td>{producto.categoria}</td>
                                        <td>{producto.oem}</td>
                                        <td>
                                            <Link to={`/administrar/${producto.id}`} className="btn-editar">Editar</Link>
                                            <button onClick={() => deleteProducto(producto.id)} className="btn-eliminar">Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {productosFiltrados.length === 0 && <p>No se encontraron productos.</p>}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default AdminDashboard;
