import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarcaService from '../../services/MarcaService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import '../../styles/administrar.css';
import '../../styles/VerProductos.css';

const CrearMarca = () => {
    const [nombre, setNombre] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        MarcaService.createMarca({ nombre }).then(() => {
            navigate('/admin/administrar-marcas');
        });
    };

    return (
        <>
            <Header />
            <div className="admin-container crear-producto-container">
                <h1>Crear Marca</h1>
                <form onSubmit={handleSubmit} className="crear-producto-form">
                    <div className="form-group">
                        <label>Nombre de la Marca :</label>
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

export default CrearMarca;
