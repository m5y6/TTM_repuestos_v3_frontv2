import React, { useState } from 'react';
import '../styles/pedido.css';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';

const Pedido = () => {
    // Estado del formulario
    const [formData, setFormData] = useState({
        nombreReceptor: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: 'Melipilla',
        codigoPostal: '',
        referencias: '',
        observaciones: ''
    });

    // Estado para errores
    const [errores, setErrores] = useState({});
    const [mensajeEstado, setMensajeEstado] = useState({ texto: '', tipo: '', mostrar: false });
    const [procesando, setProcesando] = useState(false);

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Aplicar transformaciones específicas según el campo
        let valorProcesado = value;
        
        switch (name) {
            case 'nombreReceptor':
                // Capitalizar nombres
                valorProcesado = value.replace(/\w\S*/g, (txt) => 
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
                break;
                
            case 'telefono':
                // Formatear teléfono chileno
                valorProcesado = formatearTelefono(value);
                break;
                
            case 'codigoPostal':
                // Solo números, máximo 7 dígitos
                valorProcesado = value.replace(/\D/g, '');
                if (valorProcesado.length > 7) {
                    valorProcesado = valorProcesado.substring(0, 7);
                }
                break;
                
            default:
                valorProcesado = value;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: valorProcesado
        }));

        // Validación en tiempo real
        validarCampo(name, valorProcesado);
    };

    // Función para formatear teléfono chileno
    const formatearTelefono = (value) => {
        let numeroLimpio = value.replace(/\D/g, '');
        
        if (numeroLimpio.length > 0) {
            // Si empieza con 56 (código de país)
            if (numeroLimpio.startsWith('56')) {
                if (numeroLimpio.length > 2 && numeroLimpio.charAt(2) === '9') {
                    return '+56 9 ' + numeroLimpio.substring(3);
                }
            } 
            // Si empieza con 9 (típico celular chileno)
            else if (numeroLimpio.startsWith('9') && numeroLimpio.length <= 9) {
                return '+56 ' + numeroLimpio;
            }
            // Si no tiene código de país, agregarlo
            else if (numeroLimpio.length > 0) {
                return '+56 9 ' + numeroLimpio;
            }
        }
        
        return value;
    };

    // Validaciones
    const validarTelefono = (telefono) => {
        const numeroLimpio = telefono.replace(/\s+/g, '').replace('+56', '');
        return /^[9]\d{8}$/.test(numeroLimpio);
    };

    const validarEmail = (email) => {
        if (email === '') return true; // Email es opcional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Validar campo individual
    const validarCampo = (nombre, valor) => {
        let mensajeError = '';

        switch (nombre) {
            case 'nombreReceptor':
                if (valor.trim() === '') {
                    mensajeError = 'El nombre del receptor es obligatorio';
                } else if (valor.trim().length < 2) {
                    mensajeError = 'Ingrese un nombre válido';
                }
                break;

            case 'telefono':
                if (valor.trim() === '') {
                    mensajeError = 'El teléfono es obligatorio';
                } else if (!validarTelefono(valor)) {
                    mensajeError = 'Ingrese un teléfono chileno válido';
                }
                break;

            case 'email':
                if (valor.trim() !== '' && !validarEmail(valor)) {
                    mensajeError = 'Ingrese un email válido';
                }
                break;

            case 'direccion':
                if (valor.trim() === '') {
                    mensajeError = 'La dirección de entrega es obligatoria';
                } else if (valor.trim().length < 5) {
                    mensajeError = 'Ingrese una dirección más específica';
                }
                break;

            case 'ciudad':
                if (valor.trim() === '') {
                    mensajeError = 'La ciudad es obligatoria';
                }
                break;

            case 'codigoPostal':
                if (valor.trim() !== '' && (valor.length < 7 || !/^\d+$/.test(valor))) {
                    mensajeError = 'Ingrese un código postal válido (7 dígitos)';
                }
                break;
        }

        setErrores(prev => ({
            ...prev,
            [nombre]: mensajeError
        }));
    };

    // Validar formulario completo
    const validarFormulario = () => {
        const nuevosErrores = {};

        // Validar campos requeridos
        if (!formData.nombreReceptor.trim()) {
            nuevosErrores.nombreReceptor = 'El nombre del receptor es obligatorio';
        }

        if (!formData.telefono.trim()) {
            nuevosErrores.telefono = 'El teléfono es obligatorio';
        } else if (!validarTelefono(formData.telefono)) {
            nuevosErrores.telefono = 'Ingrese un teléfono chileno válido';
        }

        if (!formData.direccion.trim()) {
            nuevosErrores.direccion = 'La dirección de entrega es obligatoria';
        }

        if (!formData.ciudad.trim()) {
            nuevosErrores.ciudad = 'La ciudad es obligatoria';
        }

        // Validar email opcional
        if (formData.email.trim() !== '' && !validarEmail(formData.email)) {
            nuevosErrores.email = 'Ingrese un email válido';
        }

        // Validar código postal opcional
        if (formData.codigoPostal.trim() !== '' && (formData.codigoPostal.length < 7 || !/^\d+$/.test(formData.codigoPostal))) {
            nuevosErrores.codigoPostal = 'Ingrese un código postal válido (7 dígitos)';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            setMensajeEstado({
                texto: 'Por favor, rellene los campos necesarios (*)',
                tipo: 'error',
                mostrar: true
            });
            return;
        }

        procesarPedido();
    };

    // Procesar pedido
    const procesarPedido = () => {
        setProcesando(true);
        setMensajeEstado({ texto: '', tipo: '', mostrar: false });

        // Simular procesamiento (en una app real, aquí iría la llamada a la API)
        setTimeout(() => {
            setMensajeEstado({
                texto: 'Pedido aceptado',
                tipo: 'exito',
                mostrar: true
            });

            // Resetear formulario
            setFormData({
                nombreReceptor: '',
                telefono: '',
                email: '',
                direccion: '',
                ciudad: 'Melipilla',
                codigoPostal: '',
                referencias: '',
                observaciones: ''
            });

            setErrores({});
            setProcesando(false);

            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                setMensajeEstado(prev => ({ ...prev, mostrar: false }));
            }, 5000);

        }, 2000);
    };

    // Función para obtener clase CSS del campo según estado
    const getFieldClassName = (fieldName) => {
        const baseClass = 'form-input';
        const hasError = errores[fieldName];
        const isRequired = ['nombreReceptor', 'telefono', 'direccion', 'ciudad'].includes(fieldName);
        const hasValue = formData[fieldName].trim() !== '';
        
        if (hasError) {
            return `${baseClass} error`;
        } else if (isRequired && hasValue) {
            return `${baseClass} success`;
        }
        return baseClass;
    };

    return (
        <>
        <Header/>

        <section className="pedido-section">
            <div className="pedido-container">
                <div className="pedido-header">
                    <h1>Realizar Pedido</h1>
                    <p>Complete los siguientes datos para procesar su pedido de repuestos</p>
                </div>

                <div className="info-adicional">
                    <h3>📦 Información de Entrega</h3>
                    <p>• Los pedidos se entregan en un plazo de 24-48 horas hábiles</p>
                    <p>• La entrega es gratuita dentro de Melipilla y alrededores</p>
                    <p>• Nuestro equipo se contactará para confirmar la entrega</p>
                </div>

                <form id="pedido-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nombre-receptor">Nombre del Receptor *</label>
                        <input
                            type="text"
                            id="nombre-receptor"
                            name="nombreReceptor"
                            className={getFieldClassName('nombreReceptor')}
                            value={formData.nombreReceptor}
                            onChange={handleChange}
                            required
                            placeholder="Ingrese el nombre completo de quien recibirá el pedido"
                        />
                        {errores.nombreReceptor && (
                            <small className="error-text">{errores.nombreReceptor}</small>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono de Contacto *</label>
                            <input
                                type="tel"
                                id="telefono"
                                name="telefono"
                                className={getFieldClassName('telefono')}
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                                placeholder="+56 9 1234 5678"
                            />
                            {errores.telefono && (
                                <small className="error-text">{errores.telefono}</small>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email de Contacto</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={getFieldClassName('email')}
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ejemplo@correo.com"
                            />
                            {errores.email && (
                                <small className="error-text">{errores.email}</small>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="direccion">Dirección de Entrega *</label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            className={getFieldClassName('direccion')}
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                            placeholder="Calle, número, población/villa"
                        />
                        {errores.direccion && (
                            <small className="error-text">{errores.direccion}</small>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="ciudad">Ciudad *</label>
                            <input
                                type="text"
                                id="ciudad"
                                name="ciudad"
                                className={getFieldClassName('ciudad')}
                                value={formData.ciudad}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Melipilla"
                            />
                            {errores.ciudad && (
                                <small className="error-text">{errores.ciudad}</small>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="codigo-postal">Código Postal</label>
                            <input
                                type="text"
                                id="codigo-postal"
                                name="codigoPostal"
                                className={getFieldClassName('codigoPostal')}
                                value={formData.codigoPostal}
                                onChange={handleChange}
                                placeholder="9580000"
                            />
                            {errores.codigoPostal && (
                                <small className="error-text">{errores.codigoPostal}</small>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="referencias">Referencias de Ubicación</label>
                        <textarea
                            id="referencias"
                            name="referencias"
                            className="form-textarea"
                            value={formData.referencias}
                            onChange={handleChange}
                            placeholder="Puntos de referencia, indicaciones especiales para llegar al lugar (cerca de, frente a, etc.)"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="observaciones">Observaciones del Pedido</label>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            className="form-textarea"
                            value={formData.observaciones}
                            onChange={handleChange}
                            placeholder="Horario preferido de entrega, instrucciones especiales, etc."
                        />
                    </div>

                    {mensajeEstado.mostrar && (
                        <div id="mensaje-estado" className={`mensaje-estado ${mensajeEstado.tipo}`}>
                            {mensajeEstado.tipo === 'error' ? '❌ ' : '✅ '}
                            {mensajeEstado.texto}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn-pedido"
                        disabled={procesando}
                        style={{
                            background: procesando 
                                ? 'linear-gradient(135deg, #999, #777)' 
                                : 'linear-gradient(135deg, #5a8756, #00bd65)',
                            cursor: procesando ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {procesando ? 'PROCESANDO...' : 'Confirmar Pedido'}
                    </button>
                </form>
            </div>
        </section>
        
        <Footer/>
        
        </>
        
    );
};

export default Pedido;