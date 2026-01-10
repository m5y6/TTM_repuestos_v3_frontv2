import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoriaService from '../../services/CategoriaService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import '../../styles/administrar.css';

const AdministrarCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [editingCategoriaId, setEditingCategoriaId] = useState(null);
    const [editingCategoriaNombre, setEditingCategoriaNombre] = useState('');

    useEffect(() => {
        fetchCategorias();
    }, []);

    const fetchCategorias = () => {
        CategoriaService.getCategorias().then(response => {
            setCategorias(response.data);
        });
    };

    const handleEditClick = (categoria) => {
        setEditingCategoriaId(categoria.id);
        setEditingCategoriaNombre(categoria.nombre);
    };

    const handleCancelClick = () => {
        setEditingCategoriaId(null);
    };

    const handleSaveClick = (id) => {
        CategoriaService.updateCategoria(id, { nombre: editingCategoriaNombre }).then(() => {
            fetchCategorias();
            setEditingCategoriaId(null);
        });
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
            CategoriaService.deleteCategoria(id).then(() => {
                fetchCategorias();
            });
        }
    };

    return (
        <>
            <Header />
            <div className="admin-container ver-productos-container">
                <h1>Administrar Categorías</h1>
                <Link to="/admin/crear-categoria" className="btn-agregar">Crear Categoría</Link>
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
                            {categorias.map((categoria) => (
                                <tr key={categoria.id}>
                                    <td>{categoria.id}</td>
                                    <td>
                                        {editingCategoriaId === categoria.id ? (
                                            <input
                                                type="text"
                                                value={editingCategoriaNombre}
                                                onChange={(e) => setEditingCategoriaNombre(e.target.value)}
                                            />
                                        ) : (
                                            categoria.nombre
                                        )}
                                    </td>
                                    <td className="acciones-cell">
                                        {editingCategoriaId === categoria.id ? (
                                            <>
                                                <button onClick={() => handleSaveClick(categoria.id)} className="btn-guardar">✔️</button>
                                                <button onClick={handleCancelClick} className="btn-cancelar">❌</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(categoria)} className="btn-editar">✏️</button>
                                                <button onClick={() => handleDeleteClick(categoria.id)} className="btn-eliminar">🗑️</button>
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

export default AdministrarCategorias;
