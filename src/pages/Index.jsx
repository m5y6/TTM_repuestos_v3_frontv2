import React, { useRef, useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/App.css'; 
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';
import ShoppingCartIcon from '../assets/icons/ShoppingCartIcon';
import SealIcon from '../assets/icons/SealIcon';
import MotorIcon from '../assets/icons/MotorIcon';
import FrenosIcon from '../assets/icons/FrenosIcon';
import SuspensionIcon from '../assets/icons/SuspensionIcon';
import NeumaticosIcon from '../assets/icons/NeumaticosIcon';
import ElectricoIcon from '../assets/icons/ElectricoIcon';
import FiltrosIcon from '../assets/icons/FiltrosIcon';
import ArticuloSeguridadIcon from '../assets/icons/ArticuloSeguridadIcon';
import InsumosAgricolasIcon from '../assets/icons/InsumosAgricolasIcon';
import ServiciosMecanicosIcon from '../assets/icons/ServiciosMecanicosIcon';
import ProductoService from '../services/ProductoService';
import CategoriaService from '../services/CategoriaService';
import { CotizacionContext } from "../context/CotizacionContext";
import WhatsAppButton from '../components/WhatsAppButton';


const ProductCard = React.forwardRef(({ producto, handleAddToCotizacion }, ref) => {
  if (!producto) {
    return null;
  }
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

  const formatearPrecio = (precio) => {
    return '$' + (precio ? precio.toLocaleString('es-CL') : '0');
  };

  return (
    <div className="producto" ref={ref}>
      <a href="#">
        <div className="producto-imagen-container">
          {producto.porcentaje_descuento > 0 && <div className="descuento-insignia">{producto.porcentaje_descuento}% OFF</div>}
          <img src={producto.imagen_url} alt={producto.nombre} className="producto-imagen" />
        </div>
        <div className="producto-info">
          <div className="producto-details">
            <span className="producto-code">ID TTM: {producto.id}</span>
            {producto.oem && <span className="producto-oem">OEM: {producto.oem}</span>}
            <span className="producto-title">{producto.nombre}</span>
          </div>
        </div>
        <div className="producto-price-actions">
            <div className="precio">
                {producto.porcentaje_descuento > 0 ? (
                    <>
                        <span className="precio-original">{formatearPrecio(producto.precio)}</span>
                        <span className="precio-descuento">{formatearPrecio(producto.precio * (1 - producto.porcentaje_descuento / 100))}</span>
                    </>
                ) : (
                    formatearPrecio(producto.precio)
                )}
            </div>
          
        </div>
      </a>
      <div className="producto-footer">
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
        <button className="cart-btn" onClick={() => handleAddToCotizacion(producto, quantity)}><ShoppingCartIcon /></button>
      </div>
    </div>
  );
});

export default function Index() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CotizacionContext);
  const [notificacion, setNotificacion] = useState('');
  const [productosEnOferta, setProductosEnOferta] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ProductoService.getAllProductos(),
      CategoriaService.getCategorias(),
    ]).then(([productosRes, categoriasRes]) => {
      const ofertas = productosRes.data.filter(p => p.porcentaje_descuento > 0).slice(0, 10);
      setProductosEnOferta(ofertas);
      
      setCategorias(categoriasRes.data);
      
      setLoading(false);
    }).catch(error => {
      console.error("Error al cargar datos para la página principal:", error);
      setLoading(false);
    });
  }, []);


  const mostrarNotificacion = (mensaje) => {
    setNotificacion(mensaje);
    setTimeout(() => {
        setNotificacion('');
    }, 3000);
  };

  const handleAddToCotizacion = (producto, quantity) => {
    addToCart(producto, quantity);
    mostrarNotificacion(`✅ ${producto.nombre} agregado a la cotización`);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideAmount, setSlideAmount] = useState(0);
  const [itemsVisible, setItemsVisible] = useState(4);
  const productRefs = useRef([]);
  const productosContainerRef = useRef(null);
  productRefs.current = [];

  useEffect(() => {
    const handleResize = () => {
      if (!productosContainerRef.current || !productosContainerRef.current.firstChild) {
        return;
      }
      
      const viewport = productosContainerRef.current.parentElement;
      const productNode = productosContainerRef.current.firstChild;
      const containerStyles = window.getComputedStyle(productosContainerRef.current);

      const productWidth = productNode.offsetWidth;
      const gap = parseInt(containerStyles.gap, 10) || 0;
      const viewportWidth = viewport.clientWidth;
      
      const totalProductWidth = productWidth + gap;
      setSlideAmount(totalProductWidth);
      
      const visible = Math.floor((viewportWidth + gap) / totalProductWidth);
      setItemsVisible(visible > 0 ? visible : 1);
    };

    setTimeout(handleResize, 100);

    window.addEventListener('resize', handleResize);
    
    const resizeObserver = new ResizeObserver(handleResize);
    if (productosContainerRef.current) {
        resizeObserver.observe(productosContainerRef.current);
    }

    return () => {
        window.removeEventListener('resize', handleResize);
        if (productosContainerRef.current) {
            resizeObserver.unobserve(productosContainerRef.current);
        }
    };
  }, [productosEnOferta, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    productRefs.current.forEach(ref => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      productRefs.current.forEach(ref => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, [productosEnOferta]);

  const addToRefs = (el) => {
    if (el && !productRefs.current.includes(el)) {
      productRefs.current.push(el);
    }
  };

  const prevSlide = () => {
    const scrollAmount = itemsVisible > 1 ? itemsVisible - 1 : 1;
    setCurrentIndex(prevIndex => Math.max(prevIndex - scrollAmount, 0));
  };

  const nextSlide = () => {
    const scrollAmount = itemsVisible > 1 ? itemsVisible - 1 : 1;
    setCurrentIndex(prevIndex => Math.min(prevIndex + scrollAmount, productosEnOferta.length - itemsVisible));
  };

  const categoriasDeseadas = [
    "Motor", 
    "Frenos", 
    "Suspensión", 
    "Neumáticos", 
    "Eléctrico", 
    "Filtros", 
    "Articulo de seguridad", 
    "Insumos agrícolas", 
    "Servicios mecánicos"
  ];

  const descripcionesCategorias = {
    "Motor": "Repuestos para motor y sistema de combustión",
    "Frenos": "Pastillas, discos y sistema de frenado",
    "Suspensión": "Amortiguadores",
    "Neumáticos": "Neumáticos para todo tipo de vehículos",
    "Eléctrico": "Baterías, alternadores y componentes eléctricos",
    "Filtros": "Filtros de aceite, aire y combustible",
    "Articulo de seguridad": "Chalecos, conos y extintores",
    "Insumos agrícolas": "Repuestos para maquinaria agrícola",
    "Servicios mecánicos": "Mantenimiento y reparación de vehículos"
  };

  const nuevasCategoriasCuarta = [
    "Lubricantes",
    "Filtros",
    "Válvulas",
    "Servicios",
    "Seguridad",
    "Agrícola"
  ];

  const categoryIcons = {
    "Motor": <MotorIcon />,
    "Frenos": <FrenosIcon />,
    "Suspensión": <SuspensionIcon />,
    "Neumáticos": <NeumaticosIcon />,
    "Eléctrico": <ElectricoIcon />,
    "Filtros": <FiltrosIcon />,
    "Articulo de seguridad": <ArticuloSeguridadIcon />,
    "Insumos agrícolas": <InsumosAgricolasIcon />,
    "Servicios mecánicos": <ServiciosMecanicosIcon />
  };

  return (
    <>
      <Header/>
      
      <div className="home-page">
      
            <section className="cuarta" onClick={(e) => {
        if (e.target.tagName === 'A') {
          e.preventDefault();
          let category = e.target.textContent;
          if (category.toLowerCase() === 'seguridad') {
            navigate(`/catalogo?categoria=articulo de seguridad`);
          } else {
            navigate(`/catalogo?categoria=${category.toLowerCase()}`);
          }
        }
      }}>
        <div className="categorias-linea">
          {nuevasCategoriasCuarta.map((categoria, index) => (
            <React.Fragment key={categoria}>
              <a href={`#${categoria.toLowerCase()}`}>{categoria}</a>
              {index < nuevasCategoriasCuarta.length - 1 && <span>|</span>}
            </React.Fragment>
          ))}
        </div>
      </section>
      
        <section className="segunda">
          <div id="galeria">
            <div className="contenedor-imagen">
              <img className="imagen" src="/img/camiones.jpg" alt="Camión Volvo en carretera" />
              <h2 className="titulo" translate="no">Truck & Trailer Melipilla</h2>
              
            </div>
          </div>
        </section>
        <section className="tercera">
          <div className="top_ventas">
            <h2>Productos en Oferta</h2>
            {loading ? <p>Cargando ofertas...</p> : (
              <div className="productos-carousel-container">
                <button className="carousel-arrow prev" onClick={prevSlide} disabled={currentIndex === 0}>&#10094;</button>
                <div className="productos-viewport">
                  <div className="productos" ref={productosContainerRef} style={{ transform: `translateX(-${currentIndex * slideAmount}px)` }}>
                    {productosEnOferta.map((producto) => (
                      <ProductCard
                        key={producto.id}
                        ref={addToRefs}
                        producto={producto}
                        handleAddToCotizacion={handleAddToCotizacion}
                      />
                    ))}
                  </div>
                </div>
                <button className="carousel-arrow next" onClick={nextSlide} disabled={currentIndex >= productosEnOferta.length - itemsVisible}>&#10095;</button>
              </div>
            )}
            <Link to="/catalogo" id="vercatalogo">Ver catálogo</Link>
          </div>
        </section>
        <section className="categorias-section">
          <div className="categorias-container">
            <h2>Explora por Categorías</h2>
            <div className="categorias-grid" onClick={(e) => {
              const card = e.target.closest('.categoria-card');
              if (card) {
                const categoryName = card.dataset.categoryName;
                if (categoryName) {
                  navigate(`/catalogo?categoria=${encodeURIComponent(categoryName)}`);
                }
              }
            }}>
              {categorias.filter(categoria => categoriasDeseadas.includes(categoria.nombre)).map(categoria => (
                <div className="categoria-card" key={categoria.id} data-category-name={categoria.nombre}>
                  <div className="categoria-icon">
                    {categoryIcons[categoria.nombre]}
                  </div>
                  <h3>{categoria.nombre}</h3>
                  <p>{descripcionesCategorias[categoria.nombre]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        
        
        {notificacion && (
            <div className="notificacion-carrito">
                {notificacion}
            </div>
        )}
        <Footer/>
      </div>
      <WhatsAppButton />
    </>
  );
}