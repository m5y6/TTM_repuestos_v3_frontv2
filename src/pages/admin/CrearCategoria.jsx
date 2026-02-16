import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoriaService from '../../services/CategoriaService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import '../../styles/administrar.css';
import '../../styles/VerProductos.css';

const CrearCategoria = () => {
    const [nombre, setNombre] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        CategoriaService.createCategoria({ nombre }).then(() => {
            navigate('/admin/administrar-categorias');
        });
    };

    return (
        <>
            <Header />
            <div className="admin-container crear-producto-container">
                <h1>Crear Categoría</h1>
                <form onSubmit={handleSubmit} className="crear-producto-form">
                    <div className="form-group">
                        <label>Nombre de la Categoría:</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            maxLength="30"
                        />
                        <div className="char-counter">
                            {nombre.length}/30
                        </div>
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

export default CrearCategoria;
