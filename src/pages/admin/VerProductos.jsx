import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import CategoriaService from '../../services/CategoriaService'; // Importar
import MarcaService from '../../services/MarcaService';       // Importar
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import { uploadFileToS3 } from '../../services/UploadService';
import '../../styles/administrar.css';

const VerProductos = () => {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [filtros, setFiltros] = useState({
        busqueda: '',
        categoria: '', // Almacenará el nombre de la categoría para el filtro
        marca: ''      // Almacenará el nombre de la marca para el filtro
    });
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);

    // State for inline editing
    const [editingProductId, setEditingProductId] = useState(null);
    const [editingProductData, setEditingProductData] = useState({});
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Cargar todos los datos iniciales en paralelo
        Promise.all([
            ProductoService.getAllProductos(),
            CategoriaService.getCategorias(),
            MarcaService.getMarcas()
        ]).then(([productosRes, categoriasRes, marcasRes]) => {
            
            const productosApi = productosRes.data.map(p => ({
                ...p,
                imagen: p.imagen_url || '/img/placeholder.jpg',
                // La API ya devuelve los nombres, así que los usamos directamente
                categoria: p.categoria.nombre, 
                marca: p.marca.nombre
            }));

            setProductos(productosApi);
            setProductosFiltrados(productosApi);
            setCategorias(categoriasRes.data);
            setMarcas(marcasRes.data);

        }).catch(error => {
            console.error("Error fetching initial data:", error);
            alert("Error al cargar los datos iniciales. Revise la consola.");
        });
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [filtros, productos]);

    const aplicarFiltros = () => {
        let resultado = [...productos];
        const normalizeString = (str) =>
            str ? str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

        if (filtros.busqueda.trim() !== '') {
            const termino = normalizeString(filtros.busqueda);
            resultado = resultado.filter(producto =>
                normalizeString(producto.nombre).includes(termino) ||
                (producto.description && normalizeString(producto.description).includes(termino)) ||
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
                    alert("Producto eliminado con éxito.");
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
        // En `editingProductData` guardamos los IDs para los selects
        const categoriaOriginal = categorias.find(c => c.nombre === producto.categoria);
        const marcaOriginal = marcas.find(m => m.nombre === producto.marca);

        setEditingProductData({
            ...producto,
            categoriaId: categoriaOriginal ? categoriaOriginal.id : '',
            marcaId: marcaOriginal ? marcaOriginal.id : ''
        });
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
        // Opción A (Recomendada por el backend): Enviar solo los IDs
        const {
            nombre,
            precio,
            porcentaje_descuento,
            oem,
            categoriaId,
            marcaId,
            imagen_url,
            description,
            id_producto
        } = editingProductData;

        const productoParaActualizar = {
            id_producto,
            nombre,
            precio: Number(precio),
            porcentaje_descuento: Number(porcentaje_descuento) || 0,
            oem,
            categoriaId, // Enviar el ID de la categoría
            marcaId,     // Enviar el ID de la marca
            imagen_url,
            description
        };

        ProductoService.updateProducto(id, productoParaActualizar)
            .then(() => {
                // Actualizamos la lista local para reflejar el cambio visualmente
                const updatedProductos = productos.map(p => {
                    if (p.id === id) {
                        const catNombre = categorias.find(c => c.id == categoriaId)?.nombre || '';
                        const marNombre = marcas.find(m => m.id == marcaId)?.nombre || '';
                        // Mantenemos la estructura completa en el estado local del frontend
                        return { ...editingProductData, categoria: catNombre, marca: marNombre };
                    }
                    return p;
                });
                setProductos(updatedProductos);
                setEditingProductId(null);
                alert("Producto actualizado con éxito.");
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
                        {/* El filtro usa nombres, así que el select también */}
                        {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                    <select name="marca" value={filtros.marca} onChange={handleFiltroChange}>
                        <option value="">Todas las marcas</option>
                        {/* El filtro usa nombres, así que el select también */}
                        {marcas.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
                    </select>
                </div>

                <div className="admin-productos-tabla">
                    <table className="tabla-fija">
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
                                            <td onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
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
                                                {isUploadingImage && <p>Subiendo...</p>}
                                            </td>
                                            <td><input type="text" name="nombre" value={editingProductData.nombre || ''} onChange={handleEditFormChange} /></td>
                                            <td><input type="number" name="precio" value={editingProductData.precio || ''} onChange={handleEditFormChange} /></td>
                                            <td><input type="number" name="porcentaje_descuento" value={editingProductData.porcentaje_descuento || ''} onChange={handleEditFormChange} /></td>
                                            <td>
                                                <select name="categoriaId" value={editingProductData.categoriaId} onChange={handleEditFormChange}>
                                                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <select name="marcaId" value={editingProductData.marcaId} onChange={handleEditFormChange}>
                                                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                                </select>
                                            </td>
                                            <td><input type="text" name="oem" value={editingProductData.oem || ''} onChange={handleEditFormChange} /></td>
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
                                            <td>{`$${Number(producto.precio).toLocaleString('es-CL')}`}</td>
                                            <td>{`${producto.porcentaje_descuento || 0}%`}</td>
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
