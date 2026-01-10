import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MarcaService from '../../services/MarcaService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import '../../styles/administrar.css';

const AdministrarMarcas = () => {
    const [marcas, setMarcas] = useState([]);
    const [editingMarcaId, setEditingMarcaId] = useState(null);
    const [editingMarcaNombre, setEditingMarcaNombre] = useState('');

    useEffect(() => {
        fetchMarcas();
    }, []);

    const fetchMarcas = () => {
        MarcaService.getMarcas().then(response => {
            setMarcas(response.data);
        });
    };

    const handleEditClick = (marca) => {
        setEditingMarcaId(marca.id);
        setEditingMarcaNombre(marca.nombre);
    };

    const handleCancelClick = () => {
        setEditingMarcaId(null);
    };

    const handleSaveClick = (id) => {
        MarcaService.updateMarca(id, { nombre: editingMarcaNombre }).then(() => {
            fetchMarcas();
            setEditingMarcaId(null);
        });
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
            MarcaService.deleteMarca(id).then(() => {
                fetchMarcas();
            });
        }
    };

    return (
        <>
            <Header />
            <div className="admin-container ver-productos-container">
                <h1>Administrar Marcas</h1>
                <Link to="/admin/crear-marca" className="btn-agregar">Crear Marca</Link>
                <div className="admin-productos-tabla">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marcas.map((marca) => (
                                <tr key={marca.id}>
                                    <td>{marca.id}</td>
                                    <td>
                                        {editingMarcaId === marca.id ? (
                                            <input
                                                type="text"
                                                value={editingMarcaNombre}
                                                onChange={(e) => setEditingMarcaNombre(e.target.value)}
                                            />
                                        ) : (
                                            marca.nombre
                                        )}
                                    </td>
                                    <td className="acciones-cell">
                                        {editingMarcaId === marca.id ? (
                                            <>
                                                <button onClick={() => handleSaveClick(marca.id)} className="btn-guardar">✔️</button>
                                                <button onClick={handleCancelClick} className="btn-cancelar">❌</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(marca)} className="btn-editar">✏️</button>
                                                <button onClick={() => handleDeleteClick(marca.id)} className="btn-eliminar">🗑️</button>
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

export default AdministrarMarcas;
