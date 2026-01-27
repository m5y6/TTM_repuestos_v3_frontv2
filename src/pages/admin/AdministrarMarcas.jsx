import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MarcaService from '../../services/MarcaService';
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

const SortableItem = ({ id, marca, index, editingMarcaId, handleEditClick, handleSaveClick, handleDeleteClick, handleCancelClick, editingMarcaNombre, setEditingMarcaNombre }) => {
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
    );
};

const AdministrarMarcas = () => {
    const [marcas, setMarcas] = useState([]);
    const [editingMarcaId, setEditingMarcaId] = useState(null);
    const [editingMarcaNombre, setEditingMarcaNombre] = useState('');
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchMarcas();
    }, []);

    const fetchMarcas = () => {
        MarcaService.getMarcas().then(response => {
            const sortedMarcas = response.data.sort((a, b) => a.orden - b.orden);
            setMarcas(sortedMarcas);
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

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setMarcas((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleGuardarOrden = () => {
        const marcasOrdenadas = marcas.map((marca, index) => ({
            id: marca.id,
            orden: index + 1,
        }));

        MarcaService.updateOrdenMarcas(marcasOrdenadas).then(() => {
            alert('Orden de marcas actualizado con éxito.');
            fetchMarcas();
        }).catch(error => {
            console.error('Error al actualizar el orden de las marcas', error);
            alert('Error al actualizar el orden de las marcas.');
        });
    };

    return (
        <>
            <Header />
            <div className="admin-container ver-productos-container">
                <h1>Administrar Marcas</h1>
                <Link to="/admin/crear-marca" className="btn-agregar">Crear Marca</Link>
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
                                    items={marcas.map(m => m.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {marcas.map((marca, index) => (
                                        <SortableItem
                                            key={marca.id}
                                            id={marca.id}
                                            marca={marca}
                                            index={index}
                                            editingMarcaId={editingMarcaId}
                                            handleEditClick={handleEditClick}
                                            handleSaveClick={handleSaveClick}
                                            handleDeleteClick={handleDeleteClick}
                                            handleCancelClick={handleCancelClick}
                                            editingMarcaNombre={editingMarcaNombre}
                                            setEditingMarcaNombre={setEditingMarcaNombre}
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

export default AdministrarMarcas;
