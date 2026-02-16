import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import CategoriaService from '../../services/CategoriaService'; // Importar
import MarcaService from '../../services/MarcaService';       // Importar
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import { uploadFileToS3 } from '../../services/UploadService';
import '../../styles/administrar.css';
import '../../styles/VerProductos.css'; // Importar los nuevos estilos
import { AuthContext } from '../../context/AuthContext';

const VerProductos = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user && user.usuario && user.usuario.rol && user.usuario.rol.nombre === 'ADMIN';
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [filtros, setFiltros] = useState({
        busqueda: '',
        categoria: '', // Almacenará el nombre de la categoría para el filtro
        marca: '',      // Almacenará el nombre de la marca para el filtro
        precio: ''     // Nuevo: para ordenar por precio ('asc', 'desc', '')
    });
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);

    // State for inline editing
    const [editingProductId, setEditingProductId] = useState(null);
    const [editingProductData, setEditingProductData] = useState({});
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageUploadError, setImageUploadError] = useState("");
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

        // Filtrado por búsqueda, categoría y marca
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

        // Ordenamiento por precio
        if (filtros.precio === 'asc') {
            resultado.sort((a, b) => a.precio - b.precio);
        } else if (filtros.precio === 'desc') {
            resultado.sort((a, b) => b.precio - a.precio);
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
        setImageUploadError("");
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
        // Si se generó una URL de vista previa, la revocamos para liberar memoria
        if (editingProductData.imageFile && editingProductData.imagen.startsWith('blob:')) {
            URL.revokeObjectURL(editingProductData.imagen);
        }
        setEditingProductId(null);
        setEditingProductData({});
        setImageUploadError("");
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditingProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = async (id) => {
        setIsUploadingImage(true); // Usamos el estado para indicar "guardando"

        try {
            let finalImageUrl = editingProductData.imagen_url;

            // 1. Si hay un archivo nuevo, subirlo
            if (editingProductData.imageFile) {
                finalImageUrl = await uploadFileToS3(editingProductData.imageFile);
            }

            // 2. Preparar los datos del producto para la API
            const {
                nombre,
                precio,
                porcentaje_descuento,
                oem,
                categoriaId,
                marcaId,
                description,
                codigo_producto
            } = editingProductData;

            const productoParaActualizar = {
                codigo_producto,
                nombre,
                precio: Number(precio),
                porcentaje_descuento: Number(porcentaje_descuento) || 0,
                oem,
                categoriaId,
                marcaId,
                imagen_url: finalImageUrl,
                description
            };

            // 3. Actualizar el producto en el backend
            await ProductoService.updateProducto(id, productoParaActualizar);

            // 4. Actualizar el estado local en el frontend
            const updatedProductos = productos.map(p => {
                if (p.id === id) {
                    const catNombre = categorias.find(c => c.id == categoriaId)?.nombre || '';
                    const marNombre = marcas.find(m => m.id == marcaId)?.nombre || '';
                    return {
                        ...editingProductData,
                        imagen: finalImageUrl, // Vista previa y dato
                        imagen_url: finalImageUrl,
                        categoria: catNombre,
                        marca: marNombre,
                        imageFile: null // Limpiar el archivo en estado
                    };
                }
                return p;
            });
            setProductos(updatedProductos);
            setEditingProductId(null);
            alert("Producto actualizado con éxito.");

        } catch (error) {
            console.error("Error updating producto:", error);
            alert("Error al actualizar el producto. Por favor, revise la consola.");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageUploadError("");
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10 MB
                setImageUploadError("El archivo excede el peso permitido de 10 MB.");
                e.target.value = "";
                return;
            }
            // Guardamos el archivo para subirlo después y creamos una URL local para la vista previa
            setEditingProductData(prev => ({
                ...prev,
                imagen: URL.createObjectURL(file), // Para vista previa
                imageFile: file // El archivo real para subir
            }));
        }
    };

    return (
        <>
            <Header />
            <div className="admin-container ver-productos-container">
                <h1>Productos</h1>
                {isAdmin && <Link to="/admin/crear-producto" className="btn-agregar">Agregar Producto</Link>}
                
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
                    <select name="precio" value={filtros.precio} onChange={handleFiltroChange}>
                        <option value="">Ordenar por precio</option>
                        <option value="asc">Menor a mayor</option>
                        <option value="desc">Mayor a menor</option>
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
                                <th>Código Producto(Opc)</th>
                                <th>Imagen</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Descuento</th>
                                <th>Descripción(Opc)</th>
                                <th>Categoría</th>
                                <th>Marca</th>
                                <th>OEM(Opc)</th>
                                {isAdmin && <th>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {productosFiltrados.map((producto) => (
                                <tr key={producto.id}>
                                    {editingProductId === producto.id ? (
                                        <>
                                            <td>{producto.id}</td>
                                            <td className="edit-mode-cell">
                                                <input type="text" name="codigo_producto" value={editingProductData.codigo_producto || ''} onChange={handleEditFormChange} maxLength="10" />
                                                <div className={`char-counter ${editingProductData.codigo_producto?.length > 10 ? 'limit-exceeded' : ''}`}>{editingProductData.codigo_producto?.length || 0}/10</div>
                                            </td>
                                            <td className="edit-mode-cell" onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
                                                <div className="image-edit-container">
                                                    <img
                                                        src={editingProductData.imagen}
                                                        alt={editingProductData.nombre}
                                                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                                    />
                                                    <div className="edit-icon-overlay">✏️</div>
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageChange}
                                                    style={{ display: 'none' }}
                                                    accept="image/png, image/jpeg"
                                                />
                                                {imageUploadError && <div style={{ color: 'red', fontSize: '0.7rem', marginTop: '5px' }}>{imageUploadError}</div>}
                                            </td>
                                            <td className="edit-mode-cell">
                                                <input type="text" name="nombre" value={editingProductData.nombre || ''} onChange={handleEditFormChange} maxLength="20" className={editingProductData.nombre?.length > 20 ? 'char-limit-exceeded' : ''} />
                                                <div className={`char-counter ${editingProductData.nombre?.length > 20 ? 'limit-exceeded' : ''}`}>{editingProductData.nombre?.length || 0}/20</div>
                                            </td>
                                            <td className="edit-mode-cell">
                                                <input type="number" name="precio" value={editingProductData.precio || ''} onChange={handleEditFormChange} />
                                                <div className="char-counter">&nbsp;</div>
                                            </td>
                                            <td className="edit-mode-cell">
                                                <input type="number" name="porcentaje_descuento" value={editingProductData.porcentaje_descuento || ''} onChange={handleEditFormChange} />
                                                <div className="char-counter">&nbsp;</div>
                                            </td>
                                            <td className="edit-mode-cell">
                                                <input type="text" name="description" value={editingProductData.description || ''} onChange={handleEditFormChange} maxLength="30" className={editingProductData.description?.length > 30 ? 'char-limit-exceeded' : ''} />
                                                <div className={`char-counter ${editingProductData.description?.length > 30 ? 'limit-exceeded' : ''}`}>{editingProductData.description?.length || 0}/30</div>
                                            </td>
                                            <td className="edit-mode-cell">
                                                <select name="categoriaId" value={editingProductData.categoriaId} onChange={handleEditFormChange}>
                                                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                                </select>
                                                <div className="char-counter">&nbsp;</div>
                                            </td>
                                            <td className="edit-mode-cell">
                                                <select name="marcaId" value={editingProductData.marcaId} onChange={handleEditFormChange}>
                                                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                                </select>
                                                <div className="char-counter">&nbsp;</div>
                                            </td>
                                            <td className="edit-mode-cell">
                                                <input type="text" name="oem" value={editingProductData.oem || ''} onChange={handleEditFormChange} maxLength="22" className={editingProductData.oem?.length > 22 ? 'char-limit-exceeded' : ''} />
                                                <div className={`char-counter ${editingProductData.oem?.length > 22 ? 'limit-exceeded' : ''}`}>{editingProductData.oem?.length || 0}/22</div>
                                            </td>
                                            <td className="acciones-cell">
                                                <button onClick={() => handleSaveClick(producto.id)} className="btn-guardar" disabled={isUploadingImage}>
                                                    ✔️
                                                </button>
                                                <button onClick={handleCancelClick} className="btn-cancelar" disabled={isUploadingImage}>❌</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{producto.id}</td>
                                            <td>{producto.codigo_producto}</td>
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
                                            <td>{producto.description}</td>
                                            <td>{producto.categoria}</td>
                                            <td>{producto.marca}</td>
                                            <td>{producto.oem}</td>
                                            {isAdmin &&
                                              <td className="acciones-cell">
                                                  <button onClick={() => handleEditClick(producto)} className="btn-editar">✏️</button>
                                                  <button onClick={() => deleteProducto(producto.id)} className="btn-eliminar">🗑️</button>
                                              </td>
                                            }
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
