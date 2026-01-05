import React, { useRef, useState } from 'react';
// Asegúrate de que la ruta a tu archivo CSS sea correcta.
import '../styles/App.css'; 
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';
import ShoppingCartIcon from '../assets/icons/ShoppingCartIcon';
import SealIcon from '../assets/icons/SealIcon';


const ProductCard = ({ imgSrc, title, price, code, discount }) => {
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="producto">
      <a href="#">
        {discount && (
          <div className="producto-badge">
            <span className="discount-value">{discount.value}</span>
            <span className="discount-text">{discount.text}</span>
          </div>
        )}
        <div className="producto-imagen-container">
          <img src={imgSrc} alt={title} className="producto-imagen" />
        </div>
        <div className="producto-info">
          <div className="producto-details">
            <span className="producto-code">ID TTM: {code}</span>
            <span className="producto-title">{title}</span>
          </div>
        </div>
        <div className="producto-price-actions">
          <div className="precio">${price.toLocaleString('es-CL')}</div>
          <div className="producto-icons">
            <button className="details-btn"><SealIcon /></button>
          </div>
        </div>
      </a>
      <div className="producto-footer">
        <div className="quantity-selector">
          <button className="sub" onClick={decreaseQuantity}>-</button>
          <input type="number" value={quantity} readOnly />
          <button className="add" onClick={increaseQuantity}>+</button>
        </div>
        <button className="cart-btn"><ShoppingCartIcon /></button>
      </div>
    </div>
  );
};

export default function Index() {
  const productosContainerRef = useRef(null);

  const scrollLeft = () => {
    productosContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    productosContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
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
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                            <path d="M2 17l10 5 10-5"></path>
                            <path d="M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <h3>Motor</h3>
                    <p>Repuestos para motor y sistema de combustión</p>
                </div>
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </div>
                    <h3>Frenos</h3>
                    <p>Pastillas, discos y sistema de frenado</p>
                </div>
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"></path>
                            <path d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4"></path>
                        </svg>
                    </div>
                    <h3>Suspensión</h3>
                    <p>Amortiguadores y muelles</p>
                </div>
                <div className="categoria-card">
                    <div className="categoria-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="6"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
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
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
                        </svg>
                    </div>
                    <h3>Filtros</h3>
                    <p>Filtros de aceite, aire y combustible</p>
                </div>
            </div>
          </div>
        </section>

        <section className="tercera">
          <div className="top_ventas">
            <h2>Productos más vendidos</h2>
            <div className="productos-carousel-container">
              <button className="carousel-arrow prev" onClick={scrollLeft}>&#10094;</button>
              <div className="productos-viewport" ref={productosContainerRef}>
                <div className="productos">
                  <ProductCard
                    imgSrc="/img/bateria.png"
                    title="Batería"
                    price={100000}
                    code="300277"
                  />
                  <ProductCard
                    imgSrc="/img/amortiguador.png"
                    title="Amortiguador"
                    price={80000}
                    code="300278"
                  />
                  <ProductCard
                    imgSrc="/img/filtro2.png"
                    title="Filtro de Aceite"
                    price={20000}
                    code="300279"
                  />
                  <ProductCard
                    imgSrc="/img/pastilla2.png"
                    title="Pastillas de Freno"
                    price={50000}
                    code="300280"
                  />
                  <ProductCard
                    imgSrc="/img/aceite2.png"
                    title="Aceite de Motor"
                    price={30000}
                    code="300281"
                  />
                  <ProductCard
                    imgSrc="/img/neumatico2.png"
                    title="Neumático"
                    price={200000}
                    code="300282"
                  />
                </div>
              </div>
              <button className="carousel-arrow next" onClick={scrollRight}>&#10095;</button>
            </div>
            <button id="vercatalogo">Ver catálogo</button>
          </div>
        </section>
        
        <Footer/>
      </div>
    </>
  );
}