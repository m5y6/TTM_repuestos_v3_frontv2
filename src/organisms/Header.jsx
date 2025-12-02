import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="primera" id="mainHeader">
        <div id="logo">
          <img src="/img/logo3.png" alt="logo" />
        </div>


        <nav className={`opciones ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={toggleMenu}>Inicio</Link>
          <Link to="/catalogo" onClick={toggleMenu}>Catálogo</Link>
          {user && (
            <>
              <Link to="/carrito" onClick={toggleMenu}>Carrito</Link>
              <Link to="/pedido" onClick={toggleMenu}>Pedido</Link>
              <Link to="/envio" onClick={toggleMenu}>Envio</Link>
            </>
          )}
          {user && (user.rol === 1 || user.rol === 2) && (
            <>
              <Link to="/administrar" onClick={toggleMenu}>Administrar</Link>
              <Link to="/ventas" onClick={toggleMenu}>Ventas</Link>
            </>
          )}
        </nav>
        
        <div className={`botones-auth ${isMenuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <button onClick={() => { logout(); toggleMenu(); }} className="boton-inicio">Cerrar Sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={toggleMenu} className="boton-inicio">Iniciar Sesión</Link>
              <Link to="/registro" onClick={toggleMenu} className="boton-registro">Registrarse</Link>
            </>
          )}
        </div>
      </header>
    </>
  );
}
