import React, { useState } from 'react';
import '../styles/envio.css';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';

const Envio = () => {
    const [numeroPedido, setNumeroPedido] = useState('TT-2025-001234');
    const [emailTracking, setEmailTracking] = useState('cliente@email.com');
    const [errores, setErrores] = useState({});
    const [mostrarResultados, setMostrarResultados] = useState(true);

    const validarFormulario = () => {
        const nuevosErrores = {};

        // Validación número de pedido
        const patronPedido = /^TT-\d{4}-\d{6}$/;
        if (numeroPedido.trim() === "") {
            nuevosErrores.numeroPedido = "El número de pedido es obligatorio";
        } else if (!patronPedido.test(numeroPedido.trim())) {
            nuevosErrores.numeroPedido = "Formato inválido. Use: TT-YYYY-NNNNNN";
        }

        // Validación email
        const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailTracking.trim() === "") {
            nuevosErrores.emailTracking = "El email es obligatorio";
        } else if (!patronEmail.test(emailTracking.trim())) {
            nuevosErrores.emailTracking = "Formato de email inválido";
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const buscarPedido = () => {
        if (validarFormulario()) {
            setMostrarResultados(true);
            // Scroll suave hacia los resultados
            setTimeout(() => {
                const trackingResults = document.getElementById('tracking-results');
                if (trackingResults) {
                    trackingResults.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            alert("Por favor corrige los errores antes de buscar el pedido");
        }
    };

    const handleNumeroPedidoChange = (e) => {
        setNumeroPedido(e.target.value);
        // Validación en tiempo real
        if (errores.numeroPedido) {
            const patron = /^TT-\d{4}-\d{6}$/;
            if (e.target.value.trim() !== "" && patron.test(e.target.value.trim())) {
                const nuevosErrores = { ...errores };
                delete nuevosErrores.numeroPedido;
                setErrores(nuevosErrores);
            }
        }
    };

    const handleEmailChange = (e) => {
        setEmailTracking(e.target.value);
        // Validación en tiempo real
        if (errores.emailTracking) {
            const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (e.target.value.trim() !== "" && patronEmail.test(e.target.value.trim())) {
                const nuevosErrores = { ...errores };
                delete nuevosErrores.emailTracking;
                setErrores(nuevosErrores);
            }
        }
    };

    return (

        <>
        <Header/>
        <div className="envio-page">

            <main className="envio-main">
                <div className="envio-container">
                    <div className="envio-header">
                        <h1>Seguimiento de Envío</h1>
                        <p>Rastrea el proceso completo de tu pedido en tiempo real</p>
                    </div>

                    <div className="tracking-search">
                        <div className="search-form">
                            <div className="search-group">
                                <label htmlFor="numero-pedido">Número de Pedido</label>
                                <input 
                                    type="text" 
                                    id="numero-pedido" 
                                    placeholder="Ej: TT-2025-001234" 
                                    value={numeroPedido}
                                    onChange={handleNumeroPedidoChange}
                                    className={errores.numeroPedido ? 'error' : ''}
                                />
                                {errores.numeroPedido && (
                                    <small className="error-text">{errores.numeroPedido}</small>
                                )}
                            </div>
                            <div className="search-group">
                                <label htmlFor="email-tracking">Email de Confirmación</label>
                                <input 
                                    type="email" 
                                    id="email-tracking" 
                                    placeholder="tu@email.com" 
                                    value={emailTracking}
                                    onChange={handleEmailChange}
                                    className={errores.emailTracking ? 'error' : ''}
                                />
                                {errores.emailTracking && (
                                    <small className="error-text">{errores.emailTracking}</small>
                                )}
                            </div>
                            <button type="button" className="search-btn" onClick={buscarPedido}>
                                Buscar
                            </button>
                        </div>
                    </div>

                    {mostrarResultados && (
                        <div className="envio-content" id="tracking-results" style={{ display: 'block' }}>
                            <div className="proceso-tracking">
                                <div className="pedido-info">
                                    <h3>Información del Pedido</h3>
                                    <div className="info-row">
                                        <div className="info-item">
                                            <strong>Número de Pedido:</strong>
                                            <span>TT-2025-001234</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Fecha de Pedido:</strong>
                                            <span>03 de Septiembre, 2025</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Estado Actual:</strong>
                                            <span className="status-badge status-current">En Preparación</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Tiempo Estimado:</strong>
                                            <span>2-3 días restantes</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="proceso-timeline">
                                    <div className="timeline-item completed">
                                        <div className="timeline-content">
                                            <h4>Pedido Confirmado</h4>
                                            <p>Tu pedido ha sido recibido y confirmado. Los productos han sido verificados y el pago procesado exitosamente.</p>
                                            <div className="timeline-meta">
                                                <span>03 Sep 2025, 14:30</span>
                                                <span className="status-badge status-completed">Completado</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="timeline-item completed">
                                        <div className="timeline-content">
                                            <h4>Procesamiento Iniciado</h4>
                                            <p>El pedido ha pasado al área de preparación. Nuestro equipo ha comenzado a recopilar y verificar los productos solicitados.</p>
                                            <div className="timeline-meta">
                                                <span>04 Sep 2025, 09:15</span>
                                                <span className="status-badge status-completed">Completado</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="timeline-item current">
                                        <div className="timeline-content">
                                            <h4>En Preparación</h4>
                                            <p>Los productos están siendo preparados y empaquetados cuidadosamente. Se están realizando las verificaciones finales de calidad.</p>
                                            <div className="timeline-meta">
                                                <span>05 Sep 2025, 11:45</span>
                                                <span className="status-badge status-current">En Proceso</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="timeline-item pending">
                                        <div className="timeline-content">
                                            <h4>Listo para Envío</h4>
                                            <p>El pedido estará completamente preparado y listo para ser enviado a la dirección especificada.</p>
                                            <div className="timeline-meta">
                                                <span>Estimado: 06 Sep 2025</span>
                                                <span className="status-badge status-pending">Pendiente</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="timeline-item pending">
                                        <div className="timeline-content">
                                            <h4>En Tránsito</h4>
                                            <p>El pedido ha sido enviado y se encuentra en camino hacia su destino. Recibirás actualizaciones del transportista.</p>
                                            <div className="timeline-meta">
                                                <span>Estimado: 07 Sep 2025</span>
                                                <span className="status-badge status-pending">Pendiente</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="timeline-item pending">
                                        <div className="timeline-content">
                                            <h4>Entregado</h4>
                                            <p>El pedido ha sido entregado exitosamente en la dirección especificada. ¡Disfruta tus productos!</p>
                                            <div className="timeline-meta">
                                                <span>Estimado: 08 Sep 2025</span>
                                                <span className="status-badge status-pending">Pendiente</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="info-adicional">
                                <div className="info-card">
                                    <h3>Información de Contacto</h3>
                                    <div className="contact-info">
                                        <p><strong>Servicio al Cliente:</strong><br />+56 9 123123</p>
                                        <p><strong>Email de Soporte:</strong><br />truck&trailer.melipilla@gmail.com</p>
                                        <p><strong>Horarios de Atención:</strong><br />Lunes a Viernes: 8:30 - 18:00<br />Sábados: 8:30 - 13:00</p>
                                        <p><strong>¿Preguntas sobre tu envío?</strong><br />No dudes en contactarnos para cualquier consulta sobre el estado de tu pedido.</p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <h3>Detalles del Envío</h3>
                                    <div className="delivery-details">
                                        <div className="detail-item">
                                            <span><strong>Método de Envío:</strong></span>
                                            <span>Envío Estándar</span>
                                        </div>
                                        <div className="detail-item">
                                            <span><strong>Dirección:</strong></span>
                                            <span>Av. Principal 123, Melipilla</span>
                                        </div>
                                        <div className="detail-item">
                                            <span><strong>Peso Total:</strong></span>
                                            <span>15.5 kg</span>
                                        </div>
                                        <div className="detail-item">
                                            <span><strong>Número de Seguimiento:</strong></span>
                                            <span>ENV-789456123</span>
                                        </div>
                                        <div className="detail-item">
                                            <span><strong>Transportista:</strong></span>
                                            <span>Transporte Regional</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            
        </div>
        

        <Footer/>
        </>
        
    );
};

export default Envio;