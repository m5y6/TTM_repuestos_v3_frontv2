import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CotizacionContext } from '../context/CotizacionContext';
import CotizacionService from "../services/CotizacionService";
import '../styles/cotizacion.css';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';

const Cotizacion = ({ sinHeaderFooter = false }) => {
    const { cartItems, removeFromCart, changeQuantity, clearCart } = useContext(CotizacionContext);
    const navigate = useNavigate();

    // Estado para la lógica de la cotización existente
    const [resumen, setResumen] = useState({
        subtotal: 0,
        descuentoProductos: 0,
        descuentoCodigo: 0,
        total: 0,
        totalItems: 0, // Cantidad total de unidades
        lineItemsCount: 0 // Cantidad de tipos de productos
    });
    const [codigoInput, setCodigoInput] = useState('');
    const [codigoAplicado, setCodigoAplicado] = useState(false);
    const [codigoActual, setCodigoActual] = useState(null);
    const [porcentajeDescuento, setPorcentajeDescuento] = useState(0);
    const [mensajeCodigo, setMensajeCodigo] = useState({ texto: '', tipo: '', mostrar: false });
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);


    const CODIGOS_DESCUENTO = {
        'FIEL40': { descuento: 15, descripcion: 'Descuento del 15%' },
        'TTM10EMPRE': { descuento: 40, descripcion: 'Descuento de empresa SOPROCAL 40%' }
    };

    const formatearPrecio = (precio) => {
        return '$' + (precio ? precio.toLocaleString('es-CL') : '0');
    };

    const actualizarResumen = () => {
        let subtotal = 0;
        let descuentoProductos = 0;
        let totalItems = 0;
        const lineItemsCount = cartItems.length; // Número de tipos de producto
        cartItems.forEach(item => {
            const precioOriginal = item.producto.precio * item.cantidad;
            subtotal += precioOriginal;
            totalItems += item.cantidad;
            if (item.producto.descuento) {
                descuentoProductos += precioOriginal * (item.producto.descuento / 100);
            }
        });
        const subtotalConDescuento = subtotal - descuentoProductos;
        let descuentoCodigo = 0;
        if (codigoAplicado && codigoActual) {
            descuentoCodigo = Math.round(subtotalConDescuento * (porcentajeDescuento / 100));
        }
        const total = subtotalConDescuento - descuentoCodigo;
        setResumen({ subtotal, descuentoProductos, descuentoCodigo, total, totalItems, lineItemsCount });
    };

    // --- Start of PDF Generation Logic ---

    const generarPdfDesdePlantilla = async () => {
        setIsGeneratingPdf(true);
        try {
            const { PDFDocument, rgb, StandardFonts } = window.PDFLib;

            const plantillaUrl = '/templates/plantilla_cotizacion.pdf';
            const plantillaBytes = await fetch(plantillaUrl).then(res => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(plantillaBytes);
            
            const firstPage = pdfDoc.getPages()[0];
            const { width, height } = firstPage.getSize();
            
            // --- Coordenadas y Constantes ---
            const initialY = height - 305;
            const bottomMargin = 100;
            const lineHeight = 20;

            // Coordenadas para la fecha (solo en la primera página)
            const dateX = width - 592;
            const dateY = height - 252; 

            // Coordenadas para la tabla de items
            const idProductoX = 40;
            const quantityX = 122;
            const nameX = 159;
            const unitPriceX = 409;
            const discountX = 478;
            const totalPriceX = 510;

            // Dibujar la fecha (solo en la primera página)
            const fecha = new Date().toLocaleDateString('es-CL');
            firstPage.drawText(`${fecha}`, {
                x: dateX,
                y: dateY,
                size: 12,
                font: await pdfDoc.embedFont(StandardFonts.Helvetica),
                color: rgb(0, 0, 0),
            });

            let currentPage = firstPage;
            let currentY = initialY;
            
            // Dibujar los items de la cotización, creando páginas según sea necesario
            for (const item of cartItems) {
                if (currentY < bottomMargin) {
                    const plantillaDoc = await PDFDocument.load(plantillaBytes);
                    const [newPageTemplate] = await pdfDoc.copyPages(plantillaDoc, [0]);
                    pdfDoc.addPage(newPageTemplate);
                    currentPage = newPageTemplate;
                    currentY = initialY;
                }
                
                const { producto, cantidad } = item;
                const precioUnitario = producto.precio;
                const precioTotalItem = precioUnitario * cantidad;
                const descuentoStr = producto.descuento ? `${producto.descuento}%` : '0%';

                currentPage.drawText(producto.id_producto || 'N/A', { x: idProductoX, y: currentY, size: 10 });
                currentPage.drawText(String(cantidad), { x: quantityX, y: currentY, size: 10 });
                currentPage.drawText(producto.nombre, { x: nameX, y: currentY, size: 10 });
                currentPage.drawText(formatearPrecio(precioUnitario), { x: unitPriceX, y: currentY, size: 10 });
                currentPage.drawText(descuentoStr, { x: discountX, y: currentY, size: 10 });
                currentPage.drawText(formatearPrecio(precioTotalItem), { x: totalPriceX, y: currentY, size: 10 });

                currentY -= lineHeight;
            }

            // --- Dibujar Totales (SIEMPRE EN LA ÚLTIMA PÁGINA) ---
            // Al final del bucle, 'currentPage' es la última página.
            const totalValueX = 499;
            const subtotalY = height - 708;
            const descuentoTotalY = height - 725;
            const totalY = descuentoTotalY - 22; 
            const totalItemsY = subtotalY + 17;
            const lineItemsY = totalItemsY + 12; // Posición para los tipos de producto

            // Tipos de Producto
            currentPage.drawText(`Total de tipos de Producto: ${resumen.lineItemsCount}`, { x: 20, y: lineItemsY-30, size: 10 });
            
            // Cantidad Total de Productos
            currentPage.drawText(`Cantidad Total de Productos: ${resumen.totalItems}`, { x: 20, y: totalItemsY-30, size: 10 });
            
            currentPage.drawText(formatearPrecio(resumen.subtotal), { x: totalValueX, y: subtotalY, size: 12 });
            
            const descuentoTotal = resumen.descuentoProductos + resumen.descuentoCodigo;
            if (descuentoTotal > 0) {
                 currentPage.drawText(`-${formatearPrecio(descuentoTotal)}`, { x: totalValueX, y: descuentoTotalY, size: 12, color: rgb(0.8, 0, 0) });
            }

            if (codigoAplicado && porcentajeDescuento > 0) {
                currentPage.drawText(`Descuento Web Aplicado: ${porcentajeDescuento}%  + `, {
                    x: 310,
                    y: descuentoTotalY - 1,
                    size: 8,
                    font: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
                    color: rgb(0.2, 0.2, 0.2),
                });
            }
            
            currentPage.drawText(formatearPrecio(resumen.total), { 
                x: totalValueX, 
                y: totalY+5, 
                size: 12, 
                font: await pdfDoc.embedFont(StandardFonts.HelveticaBold) 
            });

            // Guardar y descargar el PDF
            const pdfBytes = await pdfDoc.save();
            download(pdfBytes, "cotizacion-TTM.pdf", "application/pdf");

        } catch (error) {
            console.error("Error generando el PDF:", error);
            alert("Hubo un problema al generar el PDF. Revisa la consola para más detalles.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };
    
    // Función helper para descargar
    function download(bytes, fileName, mimeType) {
        const blob = new Blob([bytes], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // --- End of PDF Generation Logic ---

    const handleWhatsAppRedirect = async () => {
        await generarPdfDesdePlantilla();

        const numeroEmpresa = "56965768092"; // Reemplaza con tu número de WhatsApp Business
        
        let mensaje = "¡Hola! Quisiera consultar el stock para los siguientes productos de mi cotización:\n\n";
        cartItems.forEach(item => {
            mensaje += `- *${item.producto.nombre}* (Cantidad: ${item.cantidad})\n`;
        });
        mensaje += "\nAdjunto el PDF con el detalle completo. ¡Muchas gracias!";

        const urlWhatsApp = `https://wa.me/${numeroEmpresa}?text=${encodeURIComponent(mensaje)}`;

        window.open(urlWhatsApp, '_blank');
        setShowWhatsAppModal(false);
    };

    const handleGenerateGuideOnly = async () => {
        await generarPdfDesdePlantilla();
        setShowWhatsAppModal(false);
    };

    // Lógica existente del componente...
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
                mostrarMensajeCodigo(`¡Código aplicado! ${CODIGOS_DESCUENTO[codigo].descripcion}`, 'exito');
            }
        } else {
            mostrarMensajeCodigo('Código inválido. Intenta con otro código.', 'error');
        }
    };

    const mostrarMensajeCodigo = (mensaje, tipo) => {
        setMensajeCodigo({ texto: mensaje, tipo, mostrar: true });
        if (tipo === 'exito') {
            setTimeout(() => setMensajeCodigo(prev => ({ ...prev, mostrar: false })), 5000);
        }
    };

    const quitarCodigoDescuento = () => {
        setCodigoAplicado(false);
        setCodigoActual(null);
        setPorcentajeDescuento(0);
        setCodigoInput('');
        setMensajeCodigo({ texto: '', tipo: '', mostrar: false });
    };

    const procederAlPago = async () => {
        try {
            const response = await CotizacionService.checkout();
            if (response.status === 200) {
                clearCart();
                navigate('/compra-exitosa', { state: { order: response.data } });
            }
        } catch (error) {
            console.error('Error en el checkout:', error);
            alert('Hubo un error al procesar la cotización. Por favor, inténtalo de nuevo.');
        }
    };

    useEffect(() => {
        actualizarResumen();
        window.scrollTo(0, 0);
    }, [cartItems, codigoAplicado, porcentajeDescuento]);

    if (cartItems.length === 0) {
        return (
            <>
                {!sinHeaderFooter && <Header/>}
                <div className="carrito-vacio">
                    <div className="carrito-vacio-icon">🛒</div>
                    <h2>Tu carrito está vacío</h2>
                    <p>¡Explora nuestro catálogo y encuentra las mejores refacciones para tu vehículo!</p>
                    <p><a href="/catalogo">Ver Catálogo</a></p>
                </div>
                {!sinHeaderFooter && <Footer/>}
            </>
        );
    }

    return (
        <>
        {!sinHeaderFooter && <Header/>}

        <section className="carrito-simple">
            <h1 className="carrito-titulo">Mi Cotizacion</h1>
            
            <div className="carrito-grid">
                <div className="carrito-items">
                    {cartItems.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="carrito-item" 
                            style={{ animationDelay: `${index * 0.1}s` }}
                            data-precio={item.producto.precio}
                        >
                            <div className="item-imagen">
                                {item.producto.descuento && <div className="descuento-insignia">{item.producto.descuento}% OFF</div>}
                                <img src={item.producto.imagenUrl} alt={item.producto.nombre} />
                            </div>
                            <div className="item-info">
                                <h3>{item.producto.nombre}</h3>
                                <p className="item-marca">{item.producto.marca} {item.producto.oem && `- ${item.producto.oem}`}</p>
                                <p>{item.producto.descripcion}</p>
                            </div>
                            <div className="item-precio">
                                {item.producto.descuento ? (
                                    <>
                                        <span className="precio-original">
                                            {formatearPrecio(item.producto.precio * item.cantidad)}
                                        </span>
                                        <span className="precio-descuento">
                                            {formatearPrecio(item.producto.precio * (1 - item.producto.descuento / 100) * item.cantidad)}
                                        </span>
                                    </>
                                ) : (
                                    formatearPrecio(item.producto.precio * item.cantidad)
                                )}
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
                    <h2>Resumen de la Cotización</h2>
                    
                    <div className="linea-resumen">
                        <span>Subtotal:</span>
                        <span id="subtotal">{formatearPrecio(resumen.subtotal)}</span>
                    </div>

                    <div className="linea-resumen">
                        <span>Tipos de Producto:</span>
                        <span id="line-items-count">{resumen.lineItemsCount}</span>
                    </div>

                    <div className="linea-resumen">
                        <span>Cantidad Total de Productos:</span>
                        <span id="total-items">{resumen.totalItems}</span>
                    </div>

                    {resumen.descuentoProductos > 0 && (
                        <div className="linea-resumen descuento-linea">
                            <span>Descuentos de productos:</span>
                            <span id="descuento-productos" style={{ color: '#e74c3c' }}>
                                -{formatearPrecio(resumen.descuentoProductos)}
                            </span>
                        </div>
                    )}
                    
                    <div className={`linea-resumen-container ${codigoAplicado && resumen.descuentoCodigo > 0 ? 'visible' : ''}`}>
                        {codigoAplicado && resumen.descuentoCodigo > 0 && (
                            <div className="linea-resumen descuento-linea">
                                <span>Descuento por código ({porcentajeDescuento}%):</span>
                                <span id="descuento-codigo" style={{ color: '#e74c3c' }}>
                                    -{formatearPrecio(resumen.descuentoCodigo)}
                                </span>
                            </div>
                        )}
                    </div>
                    
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
                                style={codigoAplicado ? { backgroundColor: '#f0f0f-0' } : {}}
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
                    
                    <button 
                        className="checkout-button" 
                        onClick={() => setShowWhatsAppModal(true)}
                        disabled={isGeneratingPdf}
                        style={{marginRight: '10px', backgroundColor: '#007bff', marginTop: '10px'}}
                    >
                        {isGeneratingPdf ? 'Generando...' : 'Generar PDF'}
                    </button>
                    
                    <button className="checkout-button" onClick={procederAlPago} style={{marginTop: '10px'}}>
                        Crear guia de cotización
                    </button>
                </div>
            </div>
        </section>

        {showWhatsAppModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <button className="modal-close" onClick={() => setShowWhatsAppModal(false)}>×</button>
                    <h3>Verificar Stock por WhatsApp</h3>
                    <p>
                        ¿Quieres enviar tu cotización a nuestro WhatsApp empresarial para confirmar el stock de los productos?
                        <br/>
                        <strong>Nota:</strong> Deberás adjuntar el PDF descargado en el chat.
                    </p>
                    <div className="modal-actions">
                        <button onClick={handleWhatsAppRedirect} className="btn-whatsapp">
                            Sí, ir a WhatsApp
                        </button>
                        <button onClick={handleGenerateGuideOnly} className="btn-secondary">
                            Generar solo guía
                        </button>
                    </div>
                </div>
            </div>
        )}

        <Footer/>
        </>
    );
};
export default Cotizacion;
