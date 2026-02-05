import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import AuthService from '../../services/AuthService';
import '../../styles/administrar.css';

const CrearUsuario = () => {
    const [email, setEmail] = useState('');
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('2');
    const [emailError, setEmailError] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(false);
    const navigate = useNavigate();

    const validateEmail = async (email) => {
        if (!email) {
            setEmailError('');
            setIsEmailValid(false);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('El formato del email no es válido.');
            setIsEmailValid(false);
            return;
        }

        try {
            const response = await AuthService.getAllUsers();
            const users = response.data;
            const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

            if (emailExists) {
                setEmailError('Este email ya está registrado.');
                setIsEmailValid(false);
            } else {
                setEmailError('');
                setIsEmailValid(true);
            }
        } catch (error) {
            console.error("Error al verificar el email:", error);
            setEmailError('Error al verificar el email.');
            setIsEmailValid(false);
        }
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        validateEmail(newEmail);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Re-validar por si acaso
        await validateEmail(email);

        if (!isEmailValid) {
            alert('Por favor, corrige los errores en el formulario antes de guardar.');
            return;
        }
        
        try {
            const userData = {
                nombre,
                email,
                password,
                rolId: parseInt(rol)
            };
            await AuthService.createUser(userData);
            alert('Usuario creado con éxito');
            navigate('/admin/administrar-cuentas');
        } catch (error) {
            console.error("Error al crear el usuario:", error);
            alert("No se pudo crear el usuario. Revisa la consola.");
        }
    };

    return (
        <>
            <Header />
            <div className="admin-container">
                <h1>Crear Usuario</h1>
                <form onSubmit={handleSubmit} className="crear-producto-form">
                    <div className="form-group">
                        <label>Nombre:</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailChange} // Validar también cuando se pierde el foco
                            required
                        />
                        {emailError && <small className="error-text" style={{ color: 'red' }}>{emailError}</small>}
                    </div>
                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Rol:</label>
                        <select value={rol} onChange={(e) => setRol(e.target.value)}>
                            <option value="2">Empleado</option>
                            <option value="1">Administrador</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-guardar">Guardar</button>
                    </div>
                </form>
            </div>
            <Footer />
        </>
    );
};

export default CrearUsuario;
