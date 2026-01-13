import React, { useRef, useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/App.css'; 
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';
import ShoppingCartIcon from '../assets/icons/ShoppingCartIcon';
import SealIcon from '../assets/icons/SealIcon';
import productosData from '../productos.json';
import categoriasData from '../categorias.json';
import { CotizacionContext } from "../context/CotizacionContext";


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
          {producto.procentaje_desc > 0 && <div className="descuento-insignia">{producto.procentaje_desc}% OFF</div>}
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
                {producto.procentaje_desc > 0 ? (
                    <>
                        <span className="precio-original">{formatearPrecio(producto.precio)}</span>
                        <span className="precio-descuento">{formatearPrecio(producto.precio * (1 - producto.procentaje_desc / 100))}</span>
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

const productos = productosData.filter(p => p.procentaje_desc > 0).slice(0, 6);

export default function Index() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CotizacionContext);
  const [notificacion, setNotificacion] = useState('');

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

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Set up a ResizeObserver to recalculate on container resize, useful for initial render and orientation changes
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
  }, [productos]);

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

  const prevSlide = () => {
    const scrollAmount = itemsVisible > 1 ? itemsVisible - 1 : 1;
    setCurrentIndex(prevIndex => Math.max(prevIndex - scrollAmount, 0));
  };

  const nextSlide = () => {
    const scrollAmount = itemsVisible > 1 ? itemsVisible - 1 : 1;
    setCurrentIndex(prevIndex => Math.min(prevIndex + scrollAmount, productos.length - itemsVisible));
  };

  return (
    <>
      <Header/>
      
      <div className="home-page">
      
            <section className="cuarta" onClick={(e) => {
        if (e.target.tagName === 'A') {
          e.preventDefault();
          const category = e.target.textContent.toLowerCase();
          navigate(`/catalogo?categoria=${category}`);
        }
      }}>
        <div className="categorias-linea">
          {categoriasData.slice(0, 6).map((categoria, index) => (
            <React.Fragment key={categoria.id}>
              <a href={`#${categoria.nombre.toLowerCase()}`}>{categoria.nombre}</a>
              {index < 5 && <span>|</span>}
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
            <div className="productos-carousel-container">
              <button className="carousel-arrow prev" onClick={prevSlide}>&#10094;</button>
              <div className="productos-viewport">
                <div className="productos" ref={productosContainerRef} style={{ transform: `translateX(-${currentIndex * slideAmount}px)` }}>
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
        <section className="categorias-section">
          <div className="categorias-container">
            <h2>Explora por Categorías</h2>
            <div className="categorias-grid" onClick={(e) => {
              const card = e.target.closest('.categoria-card');
              if (card) {
                const category = card.querySelector('h3').textContent.toLowerCase();
                navigate(`/catalogo?categoria=${category}`);
              }
            }}>
              {categoriasData.slice(0, 9).map(categoria => (
                <div className="categoria-card" key={categoria.id}>
                  <div className="categoria-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1.6 a3.2 3.2 0 0 0 -3.2 3.2v1.6H6.4a1.6 1.6 0 0 0 -1.6 1.6v6.4a1.6 1.6 0 0 0 1.6 1.6h11.2a1.6 1.6 0 0 0 1.6 -1.6V8a1.6 1.6 0 0 0 -1.6 -1.6h-2.4V4.8A3.2 3.2 0 0 0 12 1.6z"/>
                      <path d="M4.8 14.4h14.4"/>
                      <path d="M8 17.6h8"/>
                      <path d="M9.6 4.8V3.2"/>
                      <path d="M14.4 4.8V3.2"/>
                    </svg>
                  </div>
                  <h3>{categoria.nombre}</h3>
                  <p>Descripción de {categoria.nombre}</p>
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
    </>
  );
}