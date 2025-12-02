import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';
import '../styles/compraExitosa.css';

const CompraExitosa = () => {
    const location = useLocation();
    const venta = location.state?.order;

    const formatearPrecio = (precio) => {
        return '$' + precio.toLocaleString('es-CL');
    };

    if (!venta) {
        return (
            <div className="status-container">
                <div className="error-icon">❌</div>
                <p>No se pudo encontrar el resumen de tu compra.</p>
                <Link to="/catalogo" className="btn-primary">Volver al Catálogo</Link>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="compra-exitosa-container">
                <div className="card">
                    <div className="card-header">
                        <div className="success-icon">✓</div>
                        <h1>¡Gracias por tu compra!</h1>
                        <p>Tu pedido ha sido confirmado y está siendo procesado.</p>
                    </div>
                    <div className="card-body">
                        <h2>Resumen del Pedido</h2>
                        <div className="info-pedido">
                            <p><strong>ID del Pedido:</strong> #{venta.id}</p>
                            <p><strong>Fecha:</strong> {new Date(venta.fechaCreacion).toLocaleDateString('es-CL')}</p>
                            <p><strong>Estado:</strong> <span className={`status status-${venta.estado.toLowerCase()}`}>{venta.estado}</span></p>
                        </div>

                        <h3>Artículos Comprados</h3>
                        <ul className="items-list">
                            {venta.items.map(item => (
                                <li key={item.id || item.productoId} className="item">
                                    <div className="item-details">
                                        <span className="item-name">{item.nombreProducto}</span>
                                        <span className="item-quantity">Cantidad: {item.cantidad}</span>
                                    </div>
                                    <div className="item-price">
                                        {formatearPrecio(item.precioUnitario * item.cantidad)}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="total-section">
                            <p><strong>Total Pagado:</strong> <span className="total-price">{formatearPrecio(venta.total)}</span></p>
                        </div>
                    </div>
                    <div className="card-footer">
                        <p>Recibirás un correo electrónico a <strong>{venta.usuarioEmail}</strong> con los detalles completos.</p>
                        <Link to="/catalogo" className="btn-primary">Seguir Comprando</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CompraExitosa;
