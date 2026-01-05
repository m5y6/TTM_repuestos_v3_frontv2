import React from 'react';
// Asegúrate de que la ruta a tu archivo CSS sea correcta.
import '../styles/App.css'; 
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';

export default function Index() {
  return (
    <>
      <Header/>
      
      <div className="home-page">
        <section className="segunda">
          <div id="galeria">
            <div className="contenedor-imagen">
              <img className="imagen" src="/img/camiones.jpg" alt="Camión Volvo en carretera" />
              <h2 className="titulo">Truck & Trailer Melipilla</h2>
              
            </div>
          </div>
        </section>

        <section className="tercera">
          <div className="top_ventas">
            <h2>Productos más vendidos</h2>
            <div className="productos">
              <div className="producto">
                <img src="/img/bateria.png" alt="Batería de camión" />
                <h3>Batería</h3>
                <p>Batería de alto rendimiento para vehículos de carga pesada.</p>
                <p className="precio">$100.000</p>
                <button>Añadir al Carrito</button>
              </div>
              <div className="producto">
                <img src="/img/amortiguador.png" alt="Amortiguador de camión" />
                <h3>Amortiguador</h3>
                <p>Amortiguador de alta resistencia para todo tipo de terreno.</p>
                <p className="precio">$80.000</p>
                <button>Añadir al Carrito</button>
              </div>
              <div className="producto">
                <img src="/img/filtro2.png" alt="Filtro de aceite para motor" />
                <h3>Filtro de Aceite</h3>
                <p>Filtro de aceite premium para motores diésel de alto cilindraje.</p>
                <p className="precio">$20.000</p>
                <button>Añadir al Carrito</button>
              </div>
              <div className="producto">
                <img src="/img/pastilla2.png" alt="Pastillas de freno para camión" />
                <h3>Pastillas de Freno</h3>
                <p>Set de pastillas de freno cerámicas para máxima seguridad.</p>
                <p className="precio">$50.000</p>
                <button>Añadir al Carrito</button>
              </div>
              <div className="producto">
                <img src="/img/aceite2.png" alt="Bidón de aceite de motor" />
                <h3>Aceite de Motor</h3>
                <p>Aceite sintético 15W-40 para motores diésel modernos.</p>
                <p className="precio">$30.000</p>
                <button>Añadir al Carrito</button>
              </div>
              <div className="producto">
                <img src="/img/neumatico2.png" alt="Neumático de camión" />
                <h3>Neumático</h3>
                <p>Neumático radial de larga duración para eje de tracción.</p>
                <p className="precio">$200.000</p>
                <button>Añadir al Carrito</button>
              </div>
            </div>
            <button id="vercatalogo">Ver catálogo</button>
          </div>
        </section>
        
        <Footer/>
      </div>
    </>
  );
}