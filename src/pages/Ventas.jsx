import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import VentaService from '../services/VentaService';
import Header from '../organisms/Header';
import Footer from '../organisms/Footer';
import '../styles/ventas.css';

const Ventas = () => {
    const [ventas, setVentas] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const response = await VentaService.getVentas();
                if (response && response.data) {
                    setVentas(response.data);
                }
            } catch (error) {
                console.error('Error al obtener las ventas:', error);
            }
        };

        fetchVentas();
    }, []);

    const handleEstadoChange = async (id, estado) => {
        console.log("Intentando actualizar venta con ID:", id); // <-- AÑADE ESTA LÍNEA
        try {
            await VentaService.updateVentaStatus(id, estado);
            setVentas(ventas.map(venta =>
                venta.id === id ? { ...venta, estado } : venta
            ));
        } catch (error) {
            console.error('Error al actualizar el estado de la venta:', error);
        }
    };

    return (
        <>
            <Header />
            <div className="ventas-container">
                <h1>Gestión de Ventas</h1>
                <table className="ventas-table">
                    <thead>
                        <tr>
                            <th>ID Venta</th>
                            <th>Cantidad de Productos</th>
                            <th>Correo Cliente</th>
                            <th>Productos</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(ventas) && ventas.map((venta) => (
                            <tr key={venta.id}>
                                <td>{venta.id}</td>
                                <td>{Array.isArray(venta.items) ? venta.items.reduce((acc, item) => acc + (item.cantidad || 0), 0) : 0}</td>
                                <td>{venta.usuarioEmail || 'No disponible'}</td>
                                <td>
                                    <ul className="productos-list">
                                        {Array.isArray(venta.items) && venta.items.map((item, index) => (
                                            <li key={item.id || index}>
                                                {item.nombreProducto || 'Producto desconocido'} (x{item.cantidad || 0})
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    <select
                                        value={venta.estado || 'PENDIENTE'}
                                        onChange={(e) => venta.id && handleEstadoChange(venta.id, e.target.value)}
                                        className={`estado-${(venta.estado || 'PENDIENTE').toLowerCase().replace(' ', '-')}`}
                                    >
                                        <option value="PENDIENTE">No atendido</option>
                                        <option value="EN_PROCESO">Aceptado (En Proceso)</option>
                                        <option value="COMPLETADO">Completado</option>
                                        <option value="CANCELADO">Rechazado (Cancelado)</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Footer />
        </>
    );
};

export default Ventas;
