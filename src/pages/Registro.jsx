import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/App.css';
import { Link } from 'react-router-dom';

const Registro = () => {
    const { register } = useContext(AuthContext);
    // Referencias para los campos del formulario
    const nombreRef = useRef(null);
    const apellidoRef = useRef(null);
    const emailRef = useRef(null);
    const telefonoRef = useRef(null);


    const clave1Ref = useRef(null);
    const clave2Ref = useRef(null);
    const edadRef = useRef(null);
    const formRef = useRef(null);

    // Estados para manejar errores
    const [errores, setErrores] = useState({});
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: '',
        edad: '',
        terminos: false

    });

    // Función para mostrar error
    const mostrarError = (campo, mensaje) => {
        setErrores(prev => ({
            ...prev,
            [campo]: mensaje
        }));
    };

    // Manejadores de cambio
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // (El resto de tus `useEffect` para validaciones en tiempo real se mantiene igual...)
    useEffect(() => {
        if (formData.nombre.trim() === "") {
            mostrarError('nombre', "El nombre es obligatorio");
        } else {
            mostrarError('nombre', null);
        }
    }, [formData.nombre]);

    useEffect(() => {
        if (formData.apellido.trim() === "") {
            mostrarError('apellido', "El apellido es obligatorio");
        } else {
            mostrarError('apellido', null);
        }
    }, [formData.apellido]);

    useEffect(() => {
        if (formData.email.trim() === "") {
            mostrarError('email', "El email es obligatorio");
        } else if (!formData.email.includes("@")) {
            mostrarError('email', "Debe contener @");
        } else {
            mostrarError('email', null);
        }
    }, [formData.email]);

    useEffect(() => {
        if (formData.telefono.length === 0) {
            mostrarError('telefono', "El teléfono es obligatorio");
        } else if (formData.telefono.length < 9) {
            mostrarError('telefono', "Ingrese un teléfono válido con más de 9 digitos");
        } else {
            mostrarError('telefono', null);
        }
    }, [formData.telefono]);

    useEffect(() => {
        if (formData.password === "") {
            mostrarError('password', "La contraseña es obligatoria");
        } else if (formData.password.length < 8) {
            mostrarError('password', "Mínimo 8 caracteres");
        } else {
            mostrarError('password', null);
        }

        if (formData.confirmPassword !== "" && formData.password !== formData.confirmPassword) {
            mostrarError('confirmPassword', "Las contraseñas no coinciden");
        } else {
            mostrarError('confirmPassword', null);
        }
    }, [formData.password, formData.confirmPassword]);
    
    // Validación al enviar
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Vuelve a validar todo por si el usuario le da a enviar sin tocar los campos
        let hayErrores = Object.values(errores).some(error => error !== null);
        const camposVacios = Object.keys(formData).some(key => {
            const optionalFields = ['terminos'];
            if(optionalFields.includes(key)) return false;
            return formData[key] === '';
        });

        if (hayErrores || camposVacios || !formData.terminos) {
            alert("Por favor corrige los errores, completa todos los campos obligatorios y acepta los términos.");
            return;
        }

        // Datos del usuario a enviar al backend
        const userData = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            password: formData.password,
            telefono: formData.telefono,
            edad: formData.edad
        };

        try {
            await register(userData);
            alert('¡Registro exitoso! Ahora serás dirigido a la página de inicio de sesión.');
            // La redirección se maneja en el AuthContext
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Hubo un error durante el registro. Por favor, inténtalo de nuevo.';
            console.error("Error en el registro:", error);
            alert(errorMessage); // Muestra el error al usuario
        }
    };

    return (
        <div className="registro-body">
            <section className="contacto-section">
                <div style={{ marginBottom: '2rem' }}>
                    <img className="logo-contacto" src="img/logo3.png" alt="logo" />
                    <h3>CONTACTO</h3>
                    <p>★ Whatsapp: +569123123</p>
                    <p>☎ Llamadas: 123123123</p>
                    <p>✉ Correo: truck&trailer.melipilla@gmail.com</p>
                </div>

                <a href="/" className="btn-index">Volver a la pagina principal</a>
            </section>
            
            <div className="registro-container">
                <div className="logo-section">
                    <h1>Truck & Trailer Melipilla</h1>
                    <p>Crea tu cuenta para acceder a repuestos de calidad</p>
                </div>

                <form ref={formRef} id="registroForm" onSubmit={handleSubmit}>
                    {/* ... Tus campos de input se mantienen igual ... */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre *</label>
                            <input 
                                type="text" 
                                id="nombre" 
                                name="nombre" 
                                required 
                                placeholder="Tu nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={errores.nombre ? 'error' : ''}
                            />
                            {errores.nombre && <small className="error-text">{errores.nombre}</small>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="apellido">Apellido *</label>
                            <input 
                                type="text" 
                                id="apellido" 
                                name="apellido" 
                                required 
                                placeholder="Tu apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                className={errores.apellido ? 'error' : ''}
                            />
                            {errores.apellido && <small className="error-text">{errores.apellido}</small>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required 
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={errores.email ? 'error' : ''}
                        />
                        {errores.email && <small className="error-text">{errores.email}</small>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono *</label>
                            <input 
                                type="tel" 
                                id="telefono" 
                                name="telefono" 
                                required 
                                placeholder="912345678"
                                value={formData.telefono}
                                onChange={handleChange}
                                className={errores.telefono ? 'error' : ''}
                            />
                            {errores.telefono && <small className="error-text">{errores.telefono}</small>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="edad">Edad *</label>
                            <input 
                                type="number" 
                                id="edad" 
                                name="edad" 
                                required 
                                placeholder="18" 
                                min="18" 
                                max="100"
                                value={formData.edad}
                                onChange={handleChange}
                                className={errores.edad ? 'error' : ''}
                            />
                            {errores.edad && <small className="error-text">{errores.edad}</small>}
                        </div>
                    </div>


                    <div className="form-group">
                        <label htmlFor="password">Contraseña *</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required 
                            placeholder="Mínimo 8 caracteres"
                            value={formData.password}
                            onChange={handleChange}
                            className={errores.password ? 'error' : ''}
                        />
                        {errores.password && <small className="error-text">{errores.password}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            required 
                            placeholder="Repite tu contraseña"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={errores.confirmPassword ? 'error' : ''}
                        />
                        {errores.confirmPassword && <small className="error-text">{errores.confirmPassword}</small>}
                    </div>
                    <div className="checkbox-group">
                        <input 
                            type="checkbox" 
                            id="terminos" 
                            name="terminos" 
                            required
                            checked={formData.terminos}
                            onChange={handleChange}
                        />
                        <label htmlFor="terminos">
                            Acepto los <a href="#" target="_blank">términos y condiciones</a> y la 
                            <a href="#" target="_blank">política de privacidad</a>
                        </label>
                    </div>

                    <div className="checkbox-group">
                        <input 
                            type="checkbox" 
                            id="newsletter" 
                            name="newsletter"
                            checked={formData.newsletter}
                            onChange={handleChange}
                        />
                        <label htmlFor="newsletter">
                            Quiero recibir ofertas y novedades por email
                        </label>
                    </div>

                    <button type="submit" className="btn-registro">Crear mi cuenta</button>

                    <div className="login-link">
                        <p>¿Ya tienes una cuenta?</p>
                        <Link to="/login">Iniciar Sesión</Link>
                    </div>
                </form>
            </div>
        </div>
    ); 
};
export default Registro;