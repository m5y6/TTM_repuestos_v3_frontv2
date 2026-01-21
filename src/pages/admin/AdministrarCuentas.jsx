import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import AuthService from '../../services/AuthService'; // Importar el servicio
import '../../styles/administrar.css';

const AdministrarCuentas = () => {
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editingUserRolId, setEditingUserRolId] = useState('');

    useEffect(() => {
        // Cargar usuarios desde el servicio
        AuthService.getAllUsers()
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error("Error al cargar los usuarios:", error);
                alert('No se pudo cargar la lista de usuarios. Verifique la consola.');
            });
    }, []);

    const handleEditClick = (user) => {
        setEditingUserId(user.id);
        setEditingUserRolId(user.rol.id); // Asumimos que el usuario tiene un objeto rol con id
    };

    const handleCancelClick = () => {
        setEditingUserId(null);
    };

    const handleSaveClick = (userId) => {
        AuthService.updateUserRole(userId, editingUserRolId)
            .then(() => {
                // Actualizamos el estado local para reflejar el cambio
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, rol: { id: editingUserRolId, nombre: editingUserRolId === 1 ? 'ADMIN' : 'USER' } } : user // Esto es un mock, idealmente la API devolvería el usuario actualizado
                ));
                setEditingUserId(null);
                alert("Rol actualizado con éxito");
            })
            .catch(error => {
                console.error("Error al actualizar el rol:", error);
                alert("No se pudo actualizar el rol.");
            });
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            AuthService.deleteUser(userId)
                .then(() => {
                    setUsers(users.filter(user => user.id !== userId));
                    alert("Usuario eliminado con éxito.");
                })
                .catch(error => {
                    console.error("Error al eliminar el usuario:", error);
                    alert("No se pudo eliminar el usuario.");
                });
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
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.nombre}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {editingUserId === user.id ? (
                                            <select 
                                                value={editingUserRolId} 
                                                onChange={(e) => setEditingUserRolId(parseInt(e.target.value))}
                                            >
                                                <option value="2">Empleado</option>
                                                <option value="1">Administrador</option>
                                            </select>
                                        ) : (
                                            // Asumimos que la API devuelve el nombre del rol en user.rol.nombre
                                            user.rol?.nombre || 'No asignado'
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
