import React, { useRef, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
// Asegúrate de que la ruta a tu archivo CSS sea correcta.
import '../styles/App.css'; 
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';
import ShoppingCartIcon from '../assets/icons/ShoppingCartIcon';
import SealIcon from '../assets/icons/SealIcon';
import productosData from '../productos.json';
import { CotizacionContext } from "../context/CotizacionContext";


const ProductCard = React.forwardRef(({ producto, handleAddToCotizacion }, ref) => {
  if (!producto) {
    // Para evitar que la aplicación se rompa si no hay producto
    return null;
  }
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity(prev => (prev === '' ? 1 : parseInt(prev, 10) + 1));
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? parseInt(prev, 10) - 1 : 1));

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Permite campo vacío o números positivos
    if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) > 0)) {
      setQuantity(value);
    }
  };

  // Si el campo queda vacío al salir, lo resetea a 1
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
          {producto.descuento && <div className="descuento-insignia">{producto.descuento}% OFF</div>}
          <img src={producto.imagen_url} alt={producto.nombre} className="producto-imagen" />
        </div>
        <div className="producto-info">
          <div className="producto-details">
            <span className="producto-code">ID TTM: {producto.id}</span>
            <span className="producto-oem">OEM: {producto.oem}</span>
            <span className="producto-title">{producto.nombre}</span>
          </div>
        </div>
        <div className="producto-price-actions">
            <div className="precio">
                {producto.descuento ? (
                    <>
                        <span className="precio-original">{formatearPrecio(producto.precio)}</span>
                        <span className="precio-descuento">{formatearPrecio(producto.precio * (1 - producto.descuento / 100))}</span>
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
        <button className="cart-btn" onClick={() => handleAddToCotizacion(producto)}><ShoppingCartIcon /></button>
      </div>
    </div>
  );
});

const productos = productosData.slice(0, 6);

export default function Index() {
  const { addToCart } = useContext(CotizacionContext);
  const [notificacion, setNotificacion] = useState('');

  const mostrarNotificacion = (mensaje) => {
    setNotificacion(mensaje);
    setTimeout(() => {
        setNotificacion('');
    }, 3000);
  };

  const handleAddToCotizacion = (producto) => {
    addToCart(producto);
    mostrarNotificacion(`✅ ${producto.nombre} agregado a la cotización`);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const productRefs = useRef([]);
  productRefs.current = [];

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
  }, []);

  const addToRefs = (el) => {
    if (el && !productRefs.current.includes(el)) {
      productRefs.current.push(el);
    }
  };

  const slideAmount = 280 + 25; // Ancho del producto + gap

  const prevSlide = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const newIndex = currentIndex < productos.length - 4 ? currentIndex + 1 : currentIndex;
    setCurrentIndex(newIndex);
  };

  return (
    <>
      <Header/>
      
      <div className="home-page">
      
      <section className="cuarta">
        <div className="categorias-linea">
          <a href="#lubricantes">Lubricantes</a>
          <span>|</span>
          <a href="#filtros">Filtros</a>
          <span>|</span>
          <a href="#valvulas">Válvulas</a>
          <span>|</span>
          <a href="#servicios">Servicios</a>
          <span>|</span>
          <a href="#seguridad">Seguridad</a>
          <span>|</span>
          <a href="#agricola">Agrícola</a>
        </div>
      </section>
      
        <section className="segunda">
          <div id="galeria">
            <div className="contenedor-imagen">
              <img className="imagen" src="/img/camiones.jpg" alt="Camión Volvo en carretera" />
              <h2 className="titulo">Truck & Trailer Melipilla</h2>
              
            </div>
          </div>
        </section>

        <section className="categorias-section">
          <div className="categorias-container">
            <h2>Explora por Categorías</h2>
            <div className="categorias-grid">
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1.6
                                   a3.2 3.2 0 0 0 -3.2 3.2v1.6H6.4a1.6 1.6 0 0 0 -1.6 1.6v6.4a1.6 1.6 0 0 0 1.6 1.6h11.2a1.6 1.6 0 0 0 1.6 -1.6V8a1.6 1.6 0 0 0 -1.6 -1.6h-2.4V4.8A3.2 3.2 0 0 0 12 1.6z"/>
                          <path d="M4.8 14.4h14.4"/>
                          <path d="M8 17.6h8"/>
                          <path d="M9.6 4.8V3.2"/>
                          <path d="M14.4 4.8V3.2"/>
                        </svg>
                    </div>
                    <h3>Motor</h3>
                    <p>Repuestos para motor y sistema de combustión</p>
                </div>
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="8"/>
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M12 4V2"/>
                          <path d="M12 22v-2"/>
                          <path d="M20 12h2"/>
                          <path d="M2 12h2"/>
                        </svg>
                    </div>
                    <h3>Frenos</h3>
                    <p>Pastillas, discos y sistema de frenado</p>
                </div>
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 4v16"/>
                          <path d="M8 4h8"/>
                          <path d="M8 20h8"/>
                          <rect x="6" y="8" width="12" height="8" rx="2"/>
                        </svg>
                    </div>
                    <h3>Suspensión</h3>
                    <p>Amortiguadores y muelles</p>
                </div>
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 2a10 10 0 0 0 -10 10"/>
                          <path d="M22 12a10 10 0 0 0 -10 -10"/>
                          <path d="M12 22a10 10 0 0 0 10 -10"/>
                          <path d="M2 12a10 10 0 0 0 10 10"/>
                          <circle cx="12" cy="12" r="4"/>
                        </svg>
                    </div>
                    <h3>Neumáticos</h3>
                    <p>Neumáticos para todo tipo de vehículos</p>
                </div>
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                    </div>
                    <h3>Eléctrico</h3>
                    <p>Baterías, alternadores y componentes eléctricos</p>
                </div>
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 8.8v6.4a1.6 1.6 0 0 1 -1.6 1.6H3.6A1.6 1.6 0 0 1 2 15.2V8.8A1.6 1.6 0 0 1 3.6 7.2h16.8a1.6 1.6 0 0 1 1.6 1.6z"/>
                          <path d="M4.8 7.2V4a1.6 1.6 0 0 1 1.6 -1.6h11.2a1.6 1.6 0 0 1 1.6 1.6v3.2"/>
                          <path d="M9.6 12h4.8"/>
                        </svg>
                    </div>
                    <h3>Filtros</h3>
                    <p>Filtros de aceite, aire y combustible</p>
                </div>
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l8 4.8V12c0 4.8-8 10-8 10S4 16.8 4 12V6.8L12 2z"/>
                          <path d="M9.6 12l1.6 1.6 3.2-3.2"/>
                        </svg>
                    </div>
                    <h3>articulo de seguridad</h3>
                    <p>Chalecos, conos y extintores</p>
                </div>
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16.8 12H22v4.8h-5.2z"/>
                          <path d="M18.4 4.8l-4 4"/>
                          <path d="M6.8 12H2v4.8h4.8z"/>
                          <path d="M8.4 4.8l4 4"/>
                          <path d="M12 2v20"/>
                        </svg>
                    </div>
                    <h3>insumos agrícolas</h3>
                    <p>Repuestos para maquinaria agrícola</p>
                </div>
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <h3>servicios mecánicos</h3>
                    <p>Mantenimiento y reparación de vehículos</p>
       
                </div>
                
            </div>
          </div>
        </section>

        <section className="tercera">
          <div className="top_ventas">
            <h2>Productos más vendidos</h2>
            <div className="productos-carousel-container">
              <button className="carousel-arrow prev" onClick={prevSlide}>&#10094;</button>
              <div className="productos-viewport">
                <div className="productos" style={{ transform: `translateX(-${currentIndex * slideAmount}px)` }}>
                  {productos.map((producto, index) => (
                    <ProductCard
                      key={index}
                      ref={addToRefs}
                      producto={producto}
                      handleAddToCotizacion={handleAddToCotizacion}
                    />
                  ))}
                </div>
              </div>
              <button className="carousel-arrow next" onClick={nextSlide}>&#10095;</button>
            </div>
            <Link to="/catalogo" id="vercatalogo">Ver catálogo</Link>
          </div>
        </section>
        
        {notificacion && (
            <div className="notificacion-carrito">
                {notificacion}
            </div>
        )}
        <Footer/>
      </div>
    </>
  );
}