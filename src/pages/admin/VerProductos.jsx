import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import '../../styles/administrar.css';

const VerProductos = () => {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [filtros, setFiltros] = useState({
        busqueda: '',
        categoria: '',
        marca: ''
    });
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);

    useEffect(() => {
        ProductoService.getAllProductos()
            .then(response => {
                console.log('API Response:', response.data); // <-- This will show the data in your browser console
                const data = response.data;
                const productosArray = Array.isArray(data) ? data : (data.productos || []);

                const productosApi = productosArray.map(p => ({
                    ...p,
                    imagen: p.imagen_url || '/img/placeholder.jpg'
                }));

                setProductos(productosApi);
                setProductosFiltrados(productosApi);
                
                const uniqueCategorias = [...new Set(productosApi.map(p => p.categoria))];
                const uniqueMarcas = [...new Set(productosApi.map(p => p.marca))];
                setCategorias(uniqueCategorias);
                setMarcas(uniqueMarcas);
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
                normalizeString(producto.oem).includes(termino)
            );
        }
        
        if (filtros.categoria) {
            resultado = resultado.filter(p => p.categoria === filtros.categoria);
        }

        if (filtros.marca) {
            resultado = resultado.filter(p => p.marca === filtros.marca);
        }

        setProductosFiltrados(resultado);
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const deleteProducto = (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                        ProductoService.deleteProducto(id)
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
        <div className="admin-container ver-productos-container">
            <h1>Productos</h1>
            <Link to="/admin/editar-producto" className="btn-agregar">Agregar Producto</Link>
            
            <div className="filtros-container" style={{display: 'flex', gap: '1rem', margin: '1rem 0'}}>
                <input
                    type="text"
                    name="busqueda"
                    placeholder="Buscar..."
                    value={filtros.busqueda}
                    onChange={handleFiltroChange}
                    className="buscador-input"
                />
                <select name="categoria" value={filtros.categoria} onChange={handleFiltroChange}>
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select name="marca" value={filtros.marca} onChange={handleFiltroChange}>
                    <option value="">Todas las marcas</option>
                    {marcas.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            <div className="admin-productos-tabla">
                <table>
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Categoría</th>
                            <th>Marca</th>
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
                                <td>{`$${producto.precio.toLocaleString('es-CL')}`}</td>
                                <td>{producto.categoria}</td>
                                <td>{producto.marca}</td>
                                <td>{producto.oem}</td>
                                <td>
                                    <Link to={`/admin/editar-producto/${producto.id}`} className="btn-editar">✏️</Link>
                                    <button onClick={() => deleteProducto(producto.id)} className="btn-eliminar">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {productosFiltrados.length === 0 && <p>No se encontraron productos.</p>}
            </div>
        </div>
    );
};

export default VerProductos;
