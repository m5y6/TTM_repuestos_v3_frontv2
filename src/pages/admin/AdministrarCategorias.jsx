import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoriaService from '../../services/CategoriaService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '../../styles/administrar.css';
import '../../styles/VerProductos.css';

const SortableItem = ({ id, categoria, index, editingCategoriaId, handleEditClick, handleSaveClick, handleDeleteClick, handleCancelClick, editingCategoriaNombre, setEditingCategoriaNombre, nombreError, validateNombre }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <tr ref={setNodeRef} style={style}>
            <td>
                <button {...attributes} {...listeners} className="btn-mover">
                    &#x2195;
                </button>
            </td>
            <td>{categoria.id}</td>
            <td className={editingCategoriaId === categoria.id ? "edit-mode-cell" : ""}>
                {editingCategoriaId === categoria.id ? (
                    <>
                        <input
                            type="text"
                            value={editingCategoriaNombre}
                            onChange={(e) => setEditingCategoriaNombre(e.target.value)}
                            onBlur={(e) => validateNombre(e.target.value)}
                            maxLength="30"
                        />
                        {nombreError && <small style={{ color: 'red' }}>{nombreError}</small>}
                        <div className="char-counter">
                            {editingCategoriaNombre.length}/30
                        </div>
                    </>
                ) : (
                    categoria.nombre
                )}
            </td>
            <td className="acciones-cell">
                {editingCategoriaId === categoria.id ? (
                    <>
                        <button onClick={() => handleSaveClick(categoria.id)} className="btn-guardar" disabled={!!nombreError}>✔️</button>
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
    );
};


const AdministrarCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [editingCategoriaId, setEditingCategoriaId] = useState(null);
    const [editingCategoriaNombre, setEditingCategoriaNombre] = useState('');
    const [nombreError, setNombreError] = useState('');
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchCategorias();
    }, []);

    const fetchCategorias = () => {
        CategoriaService.getCategorias().then(response => {
            const sortedCategorias = response.data.sort((a, b) => a.orden - b.orden);
            setCategorias(sortedCategorias);
        });
    };

    const handleEditClick = (categoria) => {
        setEditingCategoriaId(categoria.id);
        setEditingCategoriaNombre(categoria.nombre);
        setNombreError('');
    };

    const handleCancelClick = () => {
        setEditingCategoriaId(null);
        setNombreError('');
    };

    const validateNombre = async (value) => {
        if (value.trim() === '') {
            setNombreError("El nombre no puede estar vacío.");
            return false;
        }
        try {
            const res = await CategoriaService.verificarNombre(value);
            if (res.data && res.data.id != editingCategoriaId) {
                setNombreError("Este nombre de categoría ya existe.");
                return false;
            }
            setNombreError("");
            return true;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setNombreError(""); // El nombre está disponible
                return true;
            }
            console.error("Error al verificar el nombre:", error);
            setNombreError("No se pudo verificar el nombre.");
            return false;
        }
    };

    const handleSaveClick = async (id) => {
        const isValid = await validateNombre(editingCategoriaNombre);
        if (!isValid) {
            return; // El error ya es visible para el usuario
        }

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

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setCategorias((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleGuardarOrden = () => {
        const categoriasOrdenadas = categorias.map((categoria, index) => ({
            id: categoria.id,
            orden: index + 1,
        }));

        CategoriaService.updateOrdenCategorias(categoriasOrdenadas).then(() => {
            alert('Orden de categorías actualizado con éxito.');
            fetchCategorias();
        }).catch(error => {
            console.error('Error al actualizar el orden de las categorías', error);
            alert('Error al actualizar el orden de las categorías.');
        });
    };


    return (
        <>
            <Header />
            <div className="admin-container ver-productos-container">
                <h1>Administrar Categorías</h1>
                <Link to="/admin/crear-categoria" className="btn-agregar">Crear Categoría</Link>
                <button onClick={handleGuardarOrden} className="btn-guardar-orden">Guardar Orden</button>
                <div className="admin-productos-tabla">
                    <table>
                        <thead>
                            <tr>
                                <th>Mover</th>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={categorias.map(c => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {categorias.map((categoria, index) => (
                                        <SortableItem
                                            key={categoria.id}
                                            id={categoria.id}
                                            categoria={categoria}
                                            index={index}
                                            editingCategoriaId={editingCategoriaId}
                                            handleEditClick={handleEditClick}
                                            handleSaveClick={handleSaveClick}
                                            handleDeleteClick={handleDeleteClick}
                                            handleCancelClick={handleCancelClick}
                                            editingCategoriaNombre={editingCategoriaNombre}
                                            setEditingCategoriaNombre={setEditingCategoriaNombre}
                                            nombreError={nombreError}
                                            validateNombre={validateNombre}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AdministrarCategorias;
