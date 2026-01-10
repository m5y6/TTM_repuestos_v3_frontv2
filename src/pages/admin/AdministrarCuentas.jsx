import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import usersData from '../../adminUser.json';
import '../../styles/administrar.css';

const AdministrarCuentas = () => {
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editingUserRol, setEditingUserRol] = useState('');

    useEffect(() => {
        // Asignar un ID único a cada usuario para la gestión del estado
        const usersWithId = usersData.map((user, index) => ({
            ...user,
            id: index + 1 
        }));
        setUsers(usersWithId);
    }, []);

    const handleEditClick = (user) => {
        setEditingUserId(user.id);
        setEditingUserRol(user.rol);
    };

    const handleCancelClick = () => {
        setEditingUserId(null);
    };

    const handleSaveClick = (userId) => {
        // Aquí iría la lógica para guardar el rol del usuario.
        // Por ahora, solo actualizaremos el estado local.
        const updatedUsers = users.map(user =>
            user.id === userId ? { ...user, rol: editingUserRol } : user
        );
        setUsers(updatedUsers);
        setEditingUserId(null);
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            const filteredUsers = users.filter(user => user.id !== userId);
            setUsers(filteredUsers);
        }
    };
    
    return (
        <>
            <Header />
            <div className="admin-container ver-productos-container">
                <h1>Administrar Cuentas</h1>
                <Link to="/admin/crear-usuario" className="btn-agregar">Crear Usuario</Link>

                <div className="admin-productos-tabla">
                    <table>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.email}</td>
                                    <td>
                                        {editingUserId === user.id ? (
                                            <select 
                                                value={editingUserRol} 
                                                onChange={(e) => setEditingUserRol(e.target.value)}
                                            >
                                                <option value="empleado">Empleado</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        ) : (
                                            user.rol
                                        )}
                                    </td>
                                    <td className="acciones-cell">
                                        {editingUserId === user.id ? (
                                            <>
                                                <button onClick={() => handleSaveClick(user.id)} className="btn-guardar">✔️</button>
                                                <button onClick={handleCancelClick} className="btn-cancelar">❌</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(user)} className="btn-editar">✏️</button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="btn-eliminar">🗑️</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AdministrarCuentas;
