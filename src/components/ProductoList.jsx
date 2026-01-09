import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductoService from "../services/ProductoService";

const ProductoList = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = () => {
    ProductoService.getAllProductos()
      .then((response) => {
        setProductos(response.data);
      })
      .catch((error) => {
        console.log("Error fetching productos:", error);
      });
  };

  const deleteProducto = (id) => {
    ProductoService.deleteProducto(id)
      .then(() => {
        fetchProductos();
      })
      .catch((error) => {
        console.log("Error deleting producto:", error);
      });
  };

  return (
    <div>
      <h2>Lista de Productos</h2>
      <Link to="/add-producto">Agregar Nuevo Producto</Link>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Descuento</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td>{producto.description}</td>
              <td>{producto.precio}</td>
              <td>{producto.procentaje_desc}%</td>
              <td>{producto.stock}</td>
              <td>{producto.categoria}</td>
              <td>
                {producto.imagen_url && (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    style={{ width: "100px" }}
                  />
                )}
              </td>
              <td>
                <Link to={`/edit-producto/${producto.id}`}>Editar</Link>
                <button onClick={() => deleteProducto(producto.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductoList;