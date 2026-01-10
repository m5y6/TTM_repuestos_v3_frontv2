import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import { uploadFileToS3 } from '../../services/UploadService'; // Import the upload service
import '../../styles/administrar.css';
import categoriasData from '../../categorias.json';
import marcasData from '../../marcas.json';

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

    // State for inline editing
    const [editingProductId, setEditingProductId] = useState(null);
    const [editingProductData, setEditingProductData] = useState({});
    const [isUploadingImage, setIsUploadingImage] = useState(false); // New state for image upload loading
    const fileInputRef = useRef(null); // Ref for the hidden file input

    useEffect(() => {
        setCategorias(categoriasData.map(c => c.nombre));
        setMarcas(marcasData.map(m => m.nombre));
        
        ProductoService.getAllProductos()
            .then(response => {
                const data = response.data;
                const productosArray = Array.isArray(data) ? data : (data.productos || []);

                const productosApi = productosArray.map(p => ({
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

    // Handlers for inline editing
    const handleEditClick = (producto) => {
        setEditingProductId(producto.id);
        setEditingProductData({ ...producto });
    };

    const handleCancelClick = () => {
        setEditingProductId(null);
        setEditingProductData({});
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditingProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = (id) => {
        ProductoService.updateProductos(id, editingProductData)
            .then(() => {
                const updatedProductos = productos.map(p =>
                    p.id === id ? editingProductData : p
                );
                setProductos(updatedProductos);
                setEditingProductId(null);
            })
            .catch(error => {
                console.error("Error updating producto:", error);
                alert("Error al actualizar el producto.");
            });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploadingImage(true);
            try {
                const imageUrl = await uploadFileToS3(file);
                setEditingProductData(prev => ({ ...prev, imagen: imageUrl, imagen_url: imageUrl }));
            } catch (error) {
                alert("Falló la subida de la imagen. Por favor, inténtalo de nuevo.");
            } finally {
                setIsUploadingImage(false);
            }
        }
    };

    return (
        <>
            <Header />
            <div className="admin-container ver-productos-container">
                <h1>Productos</h1>
                <Link to="/admin/crear-producto" className="btn-agregar">Agregar Producto</Link>
                
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
                                <th>ID</th>
                                <th>Imagen</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Descuento</th>
                                <th>Categoría</th>
                                <th>Marca</th>
                                <th>OEM</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productosFiltrados.map((producto) => (
                                <tr key={producto.id}>
                                    {editingProductId === producto.id ? (
                                        <>
                                            <td>{producto.id}</td>
                                            <td onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
                                                <img
                                                    src={editingProductData.imagen}
                                                    alt={editingProductData.nombre}
                                                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                                />
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageChange}
                                                    style={{ display: 'none' }}
                                                    accept="image/png, image/jpeg"
                                                />
                                                {isUploadingImage && <p>Subiendo imagen...</p>}
                                            </td>
                                            <td><input type="text" name="nombre" value={editingProductData.nombre} onChange={handleEditFormChange} /></td>
                                            <td><input type="number" name="precio" value={editingProductData.precio} onChange={handleEditFormChange} /></td>
                                            <td><input type="number" name="procentaje_desc" value={editingProductData.procentaje_desc} onChange={handleEditFormChange} /></td>
                                            <td>
                                                <select name="categoria" value={editingProductData.categoria} onChange={handleEditFormChange}>
                                                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <select name="marca" value={editingProductData.marca} onChange={handleEditFormChange}>
                                                    {marcas.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            </td>
                                            <td><input type="text" name="oem" value={editingProductData.oem} onChange={handleEditFormChange} /></td>
                                            <td className="acciones-cell">
                                                <button onClick={() => handleSaveClick(producto.id)} className="btn-guardar">✔️</button>
                                                <button onClick={handleCancelClick} className="btn-cancelar">❌</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{producto.id}</td>
                                            <td>
                                                <img
                                                    src={producto.imagen}
                                                    alt={producto.nombre}
                                                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                                />
                                            </td>
                                            <td>{producto.nombre}</td>
                                            <td>{`$${producto.precio.toLocaleString('es-CL')}`}</td>
                                            <td>{`${producto.procentaje_desc || 0}%`}</td>
                                            <td>{producto.categoria}</td>
                                            <td>{producto.marca}</td>
                                            <td>{producto.oem}</td>
                                            <td className="acciones-cell">
                                                <button onClick={() => handleEditClick(producto)} className="btn-editar">✏️</button>
                                                <button onClick={() => deleteProducto(producto.id)} className="btn-eliminar">🗑️</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {productosFiltrados.length === 0 && <p>No se encontraron productos.</p>}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VerProductos;
