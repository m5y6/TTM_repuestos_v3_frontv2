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
        total: 0
    });
    const [codigoInput, setCodigoInput] = useState('');
    const [codigoAplicado, setCodigoAplicado] = useState(false);
    const [codigoActual, setCodigoActual] = useState(null);
    const [porcentajeDescuento, setPorcentajeDescuento] = useState(0);
    const [mensajeCodigo, setMensajeCodigo] = useState({ texto: '', tipo: '', mostrar: false });
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);


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
        cartItems.forEach(item => {
            const precioOriginal = item.producto.precio * item.cantidad;
            subtotal += precioOriginal;
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
        setResumen({ subtotal, descuentoProductos, descuentoCodigo, total });
    };

    // --- Start of PDF Generation Logic ---

    const generarPdfDesdePlantilla = async () => {
        setIsGeneratingPdf(true);
        try {
            const { PDFDocument, rgb, StandardFonts } = window.PDFLib;

            const plantillaUrl = '/templates/plantilla_cotizacion.pdf';
            const plantillaBytes = await fetch(plantillaUrl).then(res => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(plantillaBytes);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const { width, height } = firstPage.getSize();
            
            // --- AJUSTA ESTAS COORDENADAS (EL ORIGEN 0,0 ES LA ESQUINA INFERIOR IZQUIERDA) ---
            
            // Coordenadas para la fecha
            const dateX = width - 593;
            const dateY = height - 230; 

            // Coordenadas y configuración para la tabla de items
            let currentY = height - 250; // Posición Y inicial para el primer item
            const lineHeight = 20;       // Espacio entre líneas
            const quantityX = 50;
            const nameX = 100;
            const unitPriceX = 380;
            const totalPriceX = 480;

            // Dibujar la fecha
            const fecha = new Date().toLocaleDateString('es-CL');
            firstPage.drawText(`${fecha}`, {
                x: dateX,
                y: dateY,
                size: 12,
                font: await pdfDoc.embedFont(StandardFonts.Helvetica),
                color: rgb(0, 0, 0),
            });
            
            // Dibujar los items de la cotización
            for (const item of cartItems) {
                if (currentY < 100) { // Si el espacio se acaba (ajusta el 100 si es necesario)
                    break; 
                }
                
                const { producto, cantidad } = item;
                const precioUnitario = producto.precio;
                const precioTotalItem = precioUnitario * cantidad;

                firstPage.drawText(String(cantidad), { x: quantityX, y: currentY, size: 10 });
                firstPage.drawText(producto.nombre, { x: nameX, y: currentY, size: 10 });
                firstPage.drawText(formatearPrecio(precioUnitario), { x: unitPriceX, y: currentY, size: 10 });
                firstPage.drawText(formatearPrecio(precioTotalItem), { x: totalPriceX, y: currentY, size: 10 });

                currentY -= lineHeight; // Mover a la siguiente línea
            }

            // Coordenadas para los totales
            currentY -= 20; // Espacio extra antes de los totales
            const totalLabelX = 380;
            const totalValueX = 480;

            firstPage.drawText('Subtotal:', { x: totalLabelX, y: currentY, size: 12 });
            firstPage.drawText(formatearPrecio(resumen.subtotal), { x: totalValueX, y: currentY, size: 12 });
            currentY -= lineHeight;
            
            if (resumen.descuentoProductos > 0) {
                 firstPage.drawText('Descuento Productos:', { x: totalLabelX, y: currentY, size: 12, color: rgb(0.8, 0, 0) });
                 firstPage.drawText(`-${formatearPrecio(resumen.descuentoProductos)}`, { x: totalValueX, y: currentY, size: 12, color: rgb(0.8, 0, 0) });
                 currentY -= lineHeight;
            }
             if (resumen.descuentoCodigo > 0) {
                 firstPage.drawText('Descuento Código:', { x: totalLabelX, y: currentY, size: 12, color: rgb(0.8, 0, 0) });
                 firstPage.drawText(`-${formatearPrecio(resumen.descuentoCodigo)}`, { x: totalValueX, y: currentY, size: 12, color: rgb(0.8, 0, 0) });
                 currentY -= lineHeight;
            }
            
            currentY -= 5;
            firstPage.drawLine({
                start: { x: totalLabelX - 10, y: currentY },
                end: { x: width - 50, y: currentY },
                thickness: 1,
                color: rgb(0.2, 0.2, 0.2),
            });
            currentY -= 15;

            firstPage.drawText('Total:', { x: totalLabelX, y: currentY, size: 14, font: await pdfDoc.embedFont(StandardFonts.HelveticaBold) });
            firstPage.drawText(formatearPrecio(resumen.total), { x: totalValueX, y: currentY, size: 14, font: await pdfDoc.embedFont(StandardFonts.HelveticaBold) });

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
                    {cartItems.map(item => (
                        <div key={item.id} className="carrito-item" data-precio={item.producto.precio}>
                            <div className="item-imagen">
                                {item.producto.descuento && <div className="descuento-insignia">{item.producto.descuento}% OFF</div>}
                                <img src={item.producto.imagenUrl} alt={item.producto.nombre} />
                            </div>
                            <div className="item-info">
                                <h3>{item.producto.nombre}</h3>
                                <p className="item-marca">{item.producto.marca}</p>
                                <p>{item.producto.descripcion}</p>
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
                    <h2>Resumen de la Cotización</h2>
                    
                    <div className="linea-resumen">
                        <span>Subtotal:</span>
                        <span id="subtotal">{formatearPrecio(resumen.subtotal)}</span>
                    </div>

                    {resumen.descuentoProductos > 0 && (
                        <div className="linea-resumen descuento-linea">
                            <span>Descuentos de productos:</span>
                            <span id="descuento-productos" style={{ color: '#e74c3c' }}>
                                -{formatearPrecio(resumen.descuentoProductos)}
                            </span>
                        </div>
                    )}
                    
                    {codigoAplicado && resumen.descuentoCodigo > 0 && (
                        <div className="linea-resumen descuento-linea">
                            <span>Descuento por código ({porcentajeDescuento}%):</span>
                            <span id="descuento-codigo" style={{ color: '#e74c3c' }}>
                                -{formatearPrecio(resumen.descuentoCodigo)}
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
                        onClick={generarPdfDesdePlantilla}
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

        <Footer/>
        </>
    );
};
export default Cotizacion;
