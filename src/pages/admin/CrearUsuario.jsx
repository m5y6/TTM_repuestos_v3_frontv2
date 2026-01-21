import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import '../../styles/administrar.css';

const CrearUsuario = ({ onAddUser }) => {
    const [email, setEmail] = useState('');
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('empleado');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica para crear el usuario.
        // Por ahora, simularemos la creación y lo pasaremos al componente padre.
        const newUser = {
            id: Date.now(), // ID temporal
            email,
            password,
            rol,
        };
        onAddUser(newUser);
        navigate('/admin/administrar-cuentas');
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
                            onChange={(e) => setNombre  (e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
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
                            <option value="empleado">Empleado</option>
                            <option value="admin">Administrador</option>
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
