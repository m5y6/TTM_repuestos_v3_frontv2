import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import CartService from '../services/CartService';
import '../styles/Carrito.css';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';

const Carrito = ({ sinHeaderFooter = false }) => {
    const { cartItems, removeFromCart, changeQuantity, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    // Variables de estado
    const PRECIO_ENVIO = 5990;
    
    // Códigos de descuento disponibles
    const CODIGOS_DESCUENTO = {
        'FIEL40': { descuento: 15, descripcion: 'Descuento del 15%' },
        'TTM10EMPRE': { descuento: 40, descripcion: 'Descuento de empresa SOPROCAL 40%' }
    };
    
    // Estado para resumen
    const [resumen, setResumen] = useState({
        subtotal: 0,
        envio: PRECIO_ENVIO,
        descuento: 0,
        total: 0
    });
    
    // Estado para código de descuento
    const [codigoInput, setCodigoInput] = useState('');
    const [codigoAplicado, setCodigoAplicado] = useState(false);
    const [codigoActual, setCodigoActual] = useState(null);
    const [porcentajeDescuento, setPorcentajeDescuento] = useState(0);
    const [montoDescuento, setMontoDescuento] = useState(0);
    const [mensajeCodigo, setMensajeCodigo] = useState({ texto: '', tipo: '', mostrar: false });

    // Función para formatear números en formato CLP
    const formatearPrecio = (precio) => {
        return '$' + precio.toLocaleString('es-CL');
    };

    // Función para calcular y actualizar los totales
    const actualizarResumen = () => {
        let subtotal = 0;
        
        // Calcular subtotal sumando todos los productos
        cartItems.forEach(producto => {
            subtotal += producto.producto.precio * producto.cantidad;
        });
        
        // Calcular envío (gratis para compras superiores a $100.000)
        let envio = PRECIO_ENVIO;
        if (subtotal >= 100000) {
            envio = 0;
        }
        
        // Calcular descuento si hay código aplicado
        let nuevoMontoDescuento = 0;
        if (codigoAplicado && codigoActual) {
            nuevoMontoDescuento = Math.round((subtotal + envio) * (porcentajeDescuento / 100));
        }
        
        setMontoDescuento(nuevoMontoDescuento);
        
        // Calcular total
        const total = subtotal + envio - nuevoMontoDescuento;
        
        // Actualizar el estado
        setResumen({
            subtotal,
            envio,
            descuento: nuevoMontoDescuento,
            total
        });
    };

    // Función para aplicar código de descuento
    const aplicarCodigoDescuento = () => {
        const codigo = codigoInput.trim().toUpperCase();
        
        if (codigo === '') {
            mostrarMensajeCodigo('Por favor ingresa un código', 'error');
            return;
        }
        
        if (CODIGOS_DESCUENTO[codigo]) {
            if (codigoAplicado) {
                mostrarMensajeCodigo('¡El código ya está aplicado!', 'info');
            } else {
                setCodigoAplicado(true);
                setCodigoActual(codigo);
                setPorcentajeDescuento(CODIGOS_DESCUENTO[codigo].descuento);
                
                mostrarMensajeCodigo(
                    `¡Código aplicado! ${CODIGOS_DESCUENTO[codigo].descripcion}`,
                    'exito'
                );
            }
        } else {
            mostrarMensajeCodigo('Código inválido. Intenta con otro código.', 'error');
        }
    };

    // Función para mostrar mensajes del código
    const mostrarMensajeCodigo = (mensaje, tipo) => {
        setMensajeCodigo({ texto: mensaje, tipo, mostrar: true });
        
        // Ocultar mensaje después de 5 segundos si es de éxito
        if (tipo === 'exito') {
            setTimeout(() => {
                setMensajeCodigo(prev => ({ ...prev, mostrar: false }));
            }, 5000);
        }
    };

    // Función para quitar código de descuento
    const quitarCodigoDescuento = () => {
        setCodigoAplicado(false);
        setCodigoActual(null);
        setPorcentajeDescuento(0);
        setMontoDescuento(0);
        setCodigoInput('');
        setMensajeCodigo({ texto: '', tipo: '', mostrar: false });
    };

    // Función para proceder al pago
    const procederAlPago = async () => {
        try {
            const response = await CartService.checkout();
            if (response.status === 200) {
                clearCart();
                navigate('/compra-exitosa', { state: { order: response.data } });
            }
        } catch (error) {
            console.error('Error en el checkout:', error);
            alert('Hubo un error al procesar la compra. Por favor, inténtalo de nuevo.');
        }
    };

    // Actualizar resumen cuando cambien los productos o el código
    useEffect(() => {
        actualizarResumen();
    }, [cartItems, codigoAplicado, porcentajeDescuento]);

    // Si no hay productos, mostrar carrito vacío
    if (cartItems.length === 0) {
        return (
            <div className="carrito-vacio">
                <div className="carrito-vacio-icon">🛒</div>
                <h2>Tu carrito está vacío</h2>
                <p>¡Explora nuestro catálogo y encuentra las mejores refacciones para tu vehículo!</p>
                <p><a href="/catalogo">Ver Catálogo</a></p>
            </div>
        );
    }

    return (
        <>
        {!sinHeaderFooter && <Header/>}

        <section className="carrito-simple">
            <h1 className="carrito-titulo">Mi Carrito de Compras</h1>
            
            <div className="carrito-grid">
                <div className="carrito-items">
                    {cartItems.map(item => (
                        <div key={item.id} className="carrito-item" data-precio={item.producto.precio}>
                            <div className="item-imagen">
                                <img src={item.producto.imagenUrl} alt={item.producto.nombre} />
                            </div>
                            <div className="item-info">
                                <h3>{item.producto.nombre}</h3>
                                <p>{item.producto.description}</p>
                            </div>
                            <div className="item-precio">
                                {formatearPrecio(item.producto.precio * item.cantidad)}
                            </div>
                            <div className="item-cantidad">
                                <button 
                                    className="btn-cantidad"
                                    onClick={() => changeQuantity(item.id, item.cantidad - 1)}
                                >
                                    -
                                </button>
                                <span className="cantidad-numero">{item.cantidad}</span>
                                <button 
                                    className="btn-cantidad"
                                    onClick={() => changeQuantity(item.id, item.cantidad + 1)}
                                >
                                    +
                                </button>
                            </div>
                            <button 
                                className="btn-eliminar"
                                onClick={() => removeFromCart(item.id)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
                
                <div className="resumen-pedido">
                    <h2>Resumen del Pedido</h2>
                    
                    <div className="linea-resumen">
                        <span>Subtotal:</span>
                        <span id="subtotal">{formatearPrecio(resumen.subtotal)}</span>
                    </div>
                    
                    <div className="linea-resumen">
                        <span>Envío:</span>
                        <span 
                            id="envio" 
                            style={resumen.envio === 0 ? { color: '#4caf50', fontWeight: 'bold' } : {}}
                        >
                            {resumen.envio === 0 ? 'GRATIS' : formatearPrecio(resumen.envio)}
                        </span>
                    </div>
                    
                    {codigoAplicado && montoDescuento > 0 && (
                        <div className="linea-resumen descuento-linea" id="descuento-linea">
                            <span>Descuento:</span>
                            <span id="descuento" style={{ color: '#4caf50' }}>
                                -{formatearPrecio(montoDescuento)}
                            </span>
                        </div>
                    )}
                    
                    <div className="linea-total">
                        <span>Total:</span>
                        <span id="total">{formatearPrecio(resumen.total)}</span>
                    </div>
                    
                    {/* Sección de código de descuento */}
                    <div className="codigo-descuento">
                        <div className="input-grupo">
                            <input 
                                type="text" 
                                id="codigo-input" 
                                placeholder="Código de descuento" 
                                maxLength="20"
                                value={codigoInput}
                                onChange={(e) => setCodigoInput(e.target.value)}
                                disabled={codigoAplicado}
                                style={codigoAplicado ? { backgroundColor: '#f0f0f0' } : {}}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        aplicarCodigoDescuento();
                                    }
                                }}
                            />
                            <button 
                                id="aplicar-codigo" 
                                className="btn-aplicar-codigo"
                                onClick={codigoAplicado ? quitarCodigoDescuento : aplicarCodigoDescuento}
                                style={codigoAplicado ? { backgroundColor: '#4caf50' } : {}}
                            >
                                {codigoAplicado ? 'Aplicado ✓' : 'Aplicar'}
                            </button>
                        </div>
                        {mensajeCodigo.mostrar && (
                            <div id="mensaje-codigo" className={`mensaje-codigo ${mensajeCodigo.tipo}`}>
                                {mensajeCodigo.texto}
                            </div>
                        )}
                    </div>
                    
                    <button className="checkout-button" onClick={procederAlPago}>
                        Proceder al Pago
                    </button>
                </div>
            </div>
        </section>

        <Footer/>
        </>
        
    );
};
export default Carrito;
