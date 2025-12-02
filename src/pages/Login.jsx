import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/App.css';
import { Link } from 'react-router-dom';

const Login = () => {
    const { login } = useContext(AuthContext);
    // Estados para el formulario
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });

    const [errores, setErrores] = useState({
        email: '',
        password: ''
    });

    // Manejador de cambios en los campos
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Limpiar error cuando el usuario empiece a escribir
        if (value.trim() !== '') {
            setErrores(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validación en tiempo real (onBlur)
    const handleBlur = (e) => {
        const { name, value } = e.target;

        if (name === 'email') {
            if (!value.trim()) {
                setErrores(prev => ({
                    ...prev,
                    email: 'El email es obligatorio'
                }));
            } else if (!value.includes('@')) {
                setErrores(prev => ({
                    ...prev,
                    email: 'Debe contener @'
                }));
            } else {
                setErrores(prev => ({
                    ...prev,
                    email: ''
                }));
            }
        }

        if (name === 'password') {
            if (!value) {
                setErrores(prev => ({
                    ...prev,
                    password: 'La contraseña es obligatoria'
                }));
            } else {
                setErrores(prev => ({
                    ...prev,
                    password: ''
                }));
            }
        }
    };

    // Manejador de envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Resetear mensajes de error
        setErrores({
            email: '',
            password: ''
        });
        
        let isValid = true;
        
        // Validar campos vacíos
        if (!formData.email.trim()) {
            setErrores(prev => ({ ...prev, email: 'El email es obligatorio' }));
            isValid = false;
        }
        
        if (!formData.password) {
            setErrores(prev => ({ ...prev, password: 'La contraseña es obligatoria' }));
            isValid = false;
        }
        
        if (!isValid) return;
        
        try {
            await login(formData.email, formData.password);
            // La redirección se maneja en el AuthContext
        } catch (error) {
            // Si el error es por credenciales incorrectas (código 401)
            if (error.response && error.response.status === 401) {
                setErrores(prev => ({
                    ...prev,
                    email: 'Correo o contraseña incorrecta' // <-- MENSAJE PERSONALIZADO
                }));
            } else {
                // Para cualquier otro tipo de error
                const errorMessage = error.response?.data?.message || 'Ocurrió un error inesperado.';
                setErrores(prev => ({
                    ...prev,
                    email: errorMessage
                }));
            }
            console.error("Error de login:", error);
        }
    };

    return (
        <div className="login-body">
            <section className="contacto-section">
                <div style={{ marginBottom: '2rem' }}>
                    <img className="logo-contacto" src="img/logo3.png" alt="logo" />
                    <h3>CONTACTO</h3>
                    <p>📱 Whatsapp: +569123123</p>
                    <p>☎ Llamadas: 123123123</p>
                    <p>✉ Correo: truck&trailer.melipilla@gmail.com</p>
                </div>
                <a href="/" className="btn-index">Volver a la pagina principal</a>
            </section>
            
            <div className="login-container">
                <div className="login-logo-section">
                    <h1>Bienvenido de Vuelta</h1>
                    <p>Inicia sesión para acceder a tu cuenta</p>
                </div>

                <form id="loginForm" onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label htmlFor="email">Email *</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required 
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errores.email ? 'error' : ''}
                        />
                        {errores.email && <small className="error-text">{errores.email}</small>}
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password">Contraseña *</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required 
                            placeholder="Tu contraseña"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errores.password ? 'error' : ''}
                        />
                        {errores.password && <small className="error-text">{errores.password}</small>}
                    </div>

                    <div className="login-options">
                        <div className="remember-me">
                            <input 
                                type="checkbox" 
                                id="remember" 
                                name="remember"
                                checked={formData.remember}
                                onChange={handleChange}
                            />
                            <label htmlFor="remember">Recordarme</label>
                        </div>
                        <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
                    </div>

                    <button type="submit" className="btn-login">Iniciar Sesión</button>

                    <div className="register-link">
                        <p>¿No tienes una cuenta?</p>
                        <Link to="/registro">Registrarse</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default Login;