import { useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef, useContext } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { CotizacionContext } from "../context/CotizacionContext";
import { AuthContext } from '../context/AuthContext'; // Importar AuthContext
// import ProductoService from '../services/ProductoService';
import productosData from '../productos.json'; // Importar el JSON local
import '../styles/Catalogo.css';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';

const ProductoCard = ({ producto, handleAddToCotizacion, formatearPrecio }) => {
    const [quantity, setQuantity] = useState(1);

    const increaseQuantity = () => setQuantity(prev => (prev === '' ? 1 : parseInt(prev, 10) + 1));
    const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? parseInt(prev, 10) - 1 : 1));

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) > 0)) {
            setQuantity(value);
        }
    };

    const handleBlur = (e) => {
        if (e.target.value === '') {
            setQuantity(1);
        }
    };

    return (
        <div className="producto-card">
            <div className="producto-imagen">
                {producto.descuento && <div className="descuento-insignia">{producto.descuento}% OFF</div>}
                <img 
                    src={producto.imagen} 
                    alt={producto.nombre} 
                    onError={(e) => { e.target.src = '/img/placeholder.jpg'; }}
                />
            </div>
            <div className="producto-info">
                <h3 className="producto-nombre">{producto.nombre}</h3>
                <p className="producto-marca">{producto.marca}</p>
                <p className="producto-descripcion">{producto.descripcion}</p>
                <span className="producto-oem">OEM: {producto.oem}</span>
                <div className="producto-precio">
                    {producto.descuento ? (
                        <>
                            <span className="precio-original">{formatearPrecio(producto.precio)}</span>
                            <span className="precio-descuento">{formatearPrecio(producto.precio * (1 - producto.descuento / 100))}</span>
                        </>
                    ) : (
                        formatearPrecio(producto.precio)
                    )}
                </div>
                <div className="producto-acciones">
                    <div className="quantity-selector">
                        <button className="sub" onClick={decreaseQuantity}>-</button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            onBlur={handleBlur}
                            min="1"
                        />
                        <button className="add" onClick={increaseQuantity}>+</button>
                    </div>
                    <button 
                        className="btn-carrito" 
                        onClick={() => handleAddToCotizacion(producto, quantity)}
                    >Agregar Cotizacion</button>
                </div>
            </div>
        </div>
    );
};

const Catalogo = ({ productosActuales: productosActualesProp, sinHeaderFooter = false }) => {
    const { addToCart } = useContext(CotizacionContext);
    const { user, showNotification } = useContext(AuthContext); // Obtener user y showNotification
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const heroImages = [
        '/img/carousel/1.png',
        '/img/carousel/2.png',
        '/img/carousel/3.png',
        '/img/carousel/4.png',
        '/img/carousel/5.png',
        '/img/carousel/6.png',
        '/img/carousel/7.png',
        '/img/carousel/8.png',
        '/img/carousel/9.png',
        '/img/carousel/10.png',
        '/img/carousel/11.png',
        '/img/carousel/12.png',
        '/img/carousel/13.png',
        '/img/carousel/14.png',
        '/img/carousel/15.png',
        '/img/carousel/16.png',
        '/img/carousel/17.png',
        '/img/carousel/18.png',
        '/img/carousel/19.png',
        '/img/carousel/20.png',
        '/img/carousel/21.png',
        '/img/carousel/22.png',
        '/img/carousel/23.png',

        
    ];

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 5000, // Aumenta la duración para un desplazamiento más lento y continuo
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 0, // Esencial para el movimiento continuo
        cssEase: 'linear', // Asegura una velocidad constante
        pauseOnHover: true, // Pausa el carrusel al pasar el mouse por encima
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    useEffect(() => {
        if (productosActualesProp) {
            setProductos(productosActualesProp);
            setLoading(false);
        } else {
            // Cargar productos desde el JSON local en lugar del servicio
            const productosApi = productosData.map(p => ({
                ...p,
                imagen: p.imagen_url || '/img/placeholder.jpg'
            }));
            setProductos(productosApi);
            setLoading(false);
            // ProductoService.getAllProductos()
            //     .then(response => {
            //         const productosApi = response.data.map(p => ({
            //             ...p,
            //             imagen: p.imagen_url || '/img/placeholder.jpg'
            //         }));
            //         setProductos(productosApi);
            //         setLoading(false);
            //     })
            //     .catch(err => {
            //         console.error("Error al cargar productos:", err);
            //         setError("No se pudieron cargar los productos. Intente nuevamente más tarde.");
            //         setLoading(false);
            //     });
        }
    }, [productosActualesProp]);
    
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [filtros, setFiltros] = useState({
        categorias: [],
        marcas: [], // Estado para las marcas
        precioMin: '',
        precioMax: '',
        orden: 'relevancia',
        busqueda: ''
    });
    const [isMarcaExpanded, setIsMarcaExpanded] = useState(false); // Estado para el expansible

    const [paginaActual, setPaginaActual] = useState(1);
    const [notificacion, setNotificacion] = useState('');
    const productosPorPagina = 15;
    const catalogoContentRef = useRef(null);

    const formatearPrecio = (precio) => {
        return '$' + (precio ? precio.toLocaleString('es-CL') : '0');
    };

    const aplicarFiltros = () => {
        const normalizeString = (str) => 
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

        let resultado = [...productos];
        if (filtros.busqueda.trim() !== '') {
            const termino = normalizeString(filtros.busqueda);
            resultado = resultado.filter(producto =>
                normalizeString(producto.nombre).includes(termino) ||
                (producto.descripcion && normalizeString(producto.descripcion).includes(termino)) ||
                normalizeString(producto.categoria).includes(termino) ||
                (producto.oem && normalizeString(producto.oem).includes(termino))
            );
        }
        if (filtros.categorias.length > 0) {
            resultado = resultado.filter(p => filtros.categorias.includes(p.categoria));
        }
        if (filtros.marcas.length > 0) {
            resultado = resultado.filter(p => filtros.marcas.includes(p.marca));
        }
        const min = parseInt(filtros.precioMin) || 0;
        const max = parseInt(filtros.precioMax) || Infinity;
        resultado = resultado.filter(p => p.precio >= min && p.precio <= max);
        switch (filtros.orden) {
            case 'precio-asc':
                resultado.sort((a, b) => a.precio - b.precio);
                break;
            case 'precio-desc':
                resultado.sort((a, b) => b.precio - a.precio);
                break;
            case 'nombre-asc':
                resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'nombre-desc':
                resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));
                break;
            default:
                break;
        }
        setProductosFiltrados(resultado);
        setPaginaActual(1);
    };

    const limpiarFiltros = () => {
        setFiltros({
            categorias: [],
            marcas: [],
            precioMin: '',
            precioMax: '',
            orden: 'relevancia',
            busqueda: ''
        });
        setProductosFiltrados([...productos]);
        setPaginaActual(1);
    };

    const handleCategoriaChange = (categoria) => {
        setFiltros(prev => ({
            ...prev,
            categorias: prev.categorias.includes(categoria)
                ? prev.categorias.filter(c => c !== categoria)
                : [...prev.categorias, categoria]
        }));
    };

    const handleMarcaChange = (marca) => {
        setFiltros(prev => ({
            ...prev,
            marcas: prev.marcas.includes(marca)
                ? prev.marcas.filter(m => m !== marca)
                : [...prev.marcas, marca]
        }));
    };

    const handleBusquedaChange = (e) => {
        setFiltros(prev => ({
            ...prev,
            busqueda: e.target.value
        }));
    };

    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const busquedaUrl = params.get('buscar');
        if (busquedaUrl) {
            setFiltros(prev => ({
                ...prev,
                busqueda: busquedaUrl
            }));
        }
    }, [location.search]);

    useEffect(() => {
        aplicarFiltros();
    }, [productos, filtros.categorias, filtros.marcas, filtros.precioMin, filtros.precioMax, filtros.orden]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            aplicarFiltros();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [productos, filtros.busqueda]);

const handleAddToCotizacion = (producto, quantity) => {
    addToCart(producto, quantity);
        mostrarNotificacion(`✅ ${producto.nombre} agregado a la cotización`);
    };

    const mostrarNotificacion = (mensaje) => {
        setNotificacion(mensaje);
        setTimeout(() => {
            setNotificacion('');
        }, 3000);
    };

    const productosActuales = productosFiltrados.slice(
        (paginaActual - 1) * productosPorPagina,
        paginaActual * productosPorPagina
    );

    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

    const irAPagina = (pagina) => {
        setPaginaActual(pagina);
        if (catalogoContentRef.current) {
            catalogoContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const paginaAnterior = () => {
        if (paginaActual > 1) {
            irAPagina(paginaActual - 1);
        }
    };

    const paginaSiguiente = () => {
        if (paginaActual < totalPaginas) {
            irAPagina(paginaActual + 1);
        }
    };

    const generarNumerosPaginas = () => {
        const maxPaginasVisibles = 5;
        let inicio = Math.max(1, paginaActual - 2);
        let fin = Math.min(totalPaginas, inicio + maxPaginasVisibles - 1);
        
        if (fin - inicio < maxPaginasVisibles - 1) {
            inicio = Math.max(1, fin - maxPaginasVisibles + 1);
        }
        
        const paginas = [];
        for (let i = inicio; i <= fin; i++) {
            paginas.push(i);
        }
        return paginas;
    };

    return (
        <>
        {!sinHeaderFooter && <Header/>}
        <div>
            <main>
                <div className="catalogo-hero">
                    <Slider {...sliderSettings}>
                        {heroImages.map((img, index) => (
                            <div key={index} className="hero-slide">
                                <img src={img} alt={`Carousel image ${index + 1}`} className="hero-image" />
                            </div>
                        ))}
                    </Slider>
                    <div className="hero-content">
                        <h1>Catálogo de Repuestos</h1>
                    </div>
                </div>

                <div className="buscador-container">
                    <div className="buscador-wrapper">
                         <div className="buscador-input-container">
                            <svg className="buscador-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input 
                                type="text" 
                                className="buscador-input" 
                                placeholder="Buscar repuestos (nombre, descripción, categoría)..."
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

                <div className="catalogo-container">
                    <aside className="filtros-sidebar">
                        {/* ... El JSX de los filtros se mantiene igual ... */}
                        <div className="filtros-header">
                            <h3>Filtrar Productos</h3>
                        </div>

                        <div className="filtro-grupo">
                            <h4>Categoría</h4>
                            <div className="filtro-opciones">
                                {['Motor', 'Frenos', 'Suspensión', 'Neumáticos', 'Eléctrica', 'Filtros', 'Artículos de seguridad', 'Insumos agrícolas', 'Servicios mecánicos', 'Herramientas', 'Lubricantes', 'Válvulas', 'Correas','Baterias'].map(categoria => (
                                    <label key={categoria} className="filtro-checkbox">
                                        <input 
                                            type="checkbox" 
                                            checked={filtros.categorias.includes(categoria)}
                                            onChange={() => handleCategoriaChange(categoria)}
                                        />
                                        <span>
                                            {categoria}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="filtro-grupo">
                            <div className="filtro-expansible-header" onClick={() => setIsMarcaExpanded(!isMarcaExpanded)}>
                                <h4>Marca</h4>
                                <span className={`expansible-icono ${isMarcaExpanded ? 'expandido' : ''}`}>▼</span>
                            </div>
                            {isMarcaExpanded && (
                                <div className="filtro-opciones">
                                    {['Force', 'Smant tools', 'Cepsa', 'Valvoline', 'Liqui moly', 'Wurth', 'Diesel technich', 'Hella', 'Bosch', 'Dayco', 'Mitsuba', 'Just power', '3M', 'Mann fiter', 'Fleetguart', 'Tecfil', 'SKF', 'Mobil', 'Castrol', 'Cummins', 'Eaton', 'North sea lubricants', 'MWM'].map(marca => (
                                        <label key={marca} className="filtro-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={filtros.marcas.includes(marca)}
                                                onChange={() => handleMarcaChange(marca)}
                                            />
                                            <span>{marca}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="filtro-grupo">
                            <h4>Rango de Precio</h4>
                            <div className="filtro-precio">
                                <div className="precio-inputs">
                                    <div className="precio-input">
                                        <label>Mínimo</label>
                                        <input type="number" placeholder="$0" min="0" step="1000" value={filtros.precioMin} onChange={(e) => setFiltros(prev => ({ ...prev, precioMin: e.target.value }))} />
                                    </div>
                                    <div className="precio-input">
                                        <label>Máximo</label>
                                        <input type="number" placeholder="$1000000" min="0" step="1000" value={filtros.precioMax} onChange={(e) => setFiltros(prev => ({ ...prev, precioMax: e.target.value }))} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="filtro-grupo">
                            <h4>Ordenar por</h4>
                            <select className="select-ordenar" value={filtros.orden} onChange={(e) => setFiltros(prev => ({ ...prev, orden: e.target.value }))}>
                                <option value="relevancia">Relevancia</option>
                                <option value="precio-asc">Precio: Menor a Mayor</option>
                                <option value="precio-desc">Precio: Mayor a Menor</option>
                                <option value="nombre-asc">Nombre: A-Z</option>
                                <option value="nombre-desc">Nombre: Z-A</option>
                            </select>
                        </div>
                        <button className="btn-limpiar" onClick={limpiarFiltros}>
                            Limpiar Filtros
                        </button>
                    </aside>

                    <div ref={catalogoContentRef} className="catalogo-content">
                        {/* 4. MANEJAR ESTADOS DE CARGA Y ERROR */}
                        {loading ? (
                            <p>Cargando productos...</p>
                        ) : error ? (
                            <p className="error-mensaje">{error}</p>
                        ) : (
                            <>
                                <div className="catalogo-header">
                                    <div className="resultados-info">
                                        <span>
                                            Mostrando <strong>{productosFiltrados.length > 0 ? (paginaActual - 1) * productosPorPagina + 1 : 0}-{Math.min(paginaActual * productosPorPagina, productosFiltrados.length)}</strong> de <strong>{productosFiltrados.length}</strong> productos
                                        </span>
                                    </div>
                                </div>

                                {productosFiltrados.length > 0 ? (
                                    <div className="productos-grid">
                                    {productosActuales.map(producto => (
                                        <ProductoCard 
                                            key={producto.id}
                                            producto={producto}
                                            handleAddToCotizacion={handleAddToCotizacion}
                                            formatearPrecio={formatearPrecio}
                                        />
                                    ))}
                                </div>
                                ) : (
                                    <p>No se encontraron productos que coincidan con los filtros.</p>
                                )}

                                {totalPaginas > 1 && (
                                    <div className="paginacion">
                                        <button className="btn-pag" onClick={paginaAnterior} disabled={paginaActual === 1}>
                                            Anterior
                                        </button>
                                        <div className="numeros-pag">
                                            {generarNumerosPaginas().map(pagina => (
                                                <button
                                                    key={pagina}
                                                    className={`btn-pag ${pagina === paginaActual ? 'active' : ''}`}
                                                    onClick={() => irAPagina(pagina)}
                                                >
                                                    {pagina}
                                                </button>
                                            ))}
                                        </div>
                                        <button className="btn-pag" onClick={paginaSiguiente} disabled={paginaActual === totalPaginas || totalPaginas === 0}>
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {notificacion && (
                <div className="notificacion-carrito">
                    {notificacion}
                </div>
            )}
        </div>
        {!sinHeaderFooter && <Footer/>}
        </>
    );
};

export default Catalogo;