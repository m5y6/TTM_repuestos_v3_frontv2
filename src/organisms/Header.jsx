import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/catalogo?buscar=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/catalogo');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <header className="primera" id="mainHeader">
        <Link to="/" id="logo">
          <img src="/img/logo3vfinalv2.png" alt="logo" />
        </Link>

        <div className="header-search">
            <div className="header-search-container">
                <svg className="header-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input 
                    type="text" 
                    id="header-buscador" 
                    className="header-search-input" 
                    placeholder="Buscar repuestos..."
                    autoComplete="off"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button type="button" className="header-search-btn" onClick={handleSearch}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </button>
            </div>
        </div>

        <nav className={`opciones ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={toggleMenu}>Inicio</Link>
          <Link to="/catalogo" onClick={toggleMenu}>Catálogo</Link>
          <Link to="/cotizacion" onClick={toggleMenu}>Cotizacion</Link>

          {(user && (user.rol === 1 || user.rol === 2)) && (
            <Link to="/administrar" onClick={toggleMenu}>Administrar</Link>
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
