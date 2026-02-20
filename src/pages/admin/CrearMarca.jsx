import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarcaService from '../../services/MarcaService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import '../../styles/administrar.css';
import '../../styles/VerProductos.css';

const CrearMarca = () => {
    const [nombre, setNombre] = useState('');
    const [nombreError, setNombreError] = useState('');
    const navigate = useNavigate();

    const handleNombreChange = async (e) => {
        const value = e.target.value;
        setNombre(value);

        if (value.trim() !== '') {
            try {
                await MarcaService.verificarNombre(value);
                setNombreError("Este nombre de marca ya existe.");
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setNombreError(""); // El nombre está disponible
                } else {
                    console.error("Error al verificar el nombre:", error);
                    setNombreError("No se pudo verificar el nombre.");
                }
            }
        } else {
            setNombreError("");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nombreError) {
            alert("El nombre de la marca ya existe.");
            return;
        }
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
                            onChange={handleNombreChange}
                            onBlur={handleNombreChange}
                            required
                            maxLength="30"
                        />
                        {nombreError && <small style={{ color: 'red' }}>{nombreError}</small>}
                        <div className="char-counter">
                            {nombre.length}/30
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-guardar" disabled={!!nombreError}>Guardar</button>
                    </div>
                </form>
            </div>
            <Footer />
        </>
    );
};

export default CrearMarca;
