import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductoService from "../../services/ProductoService";
import { uploadFileToS3 } from '../../services/UploadService';
import "../../styles/administrar.css";

const EditarProducto = () => {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [imagen_url, setImagenUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      ProductoService.getProductoById(id).then((response) => {
        const producto = response.data;
        setNombre(producto.nombre);
        setPrecio(producto.precio);
        setCategoria(producto.categoria);
        setDescription(producto.description);
        setStock(producto.stock);
        setImagenUrl(producto.imagen_url);
      }).catch(err => {
        console.error("Error fetching product:", err);
        // Maybe navigate back or show an error
        navigate('/administrar');
      });
    }
  }, [id, navigate]);

  const handleImagenChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadFileToS3(file);
        setImagenUrl(imageUrl);
      } catch (error) {
        alert("Falló la subida de la imagen. Por favor, inténtalo de nuevo.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const saveOrUpdateProducto = async (e) => {
    e.preventDefault();

    const producto = {
      nombre,
      precio: parseFloat(precio),
      categoria,
      description,
      stock: parseInt(stock, 10),
      imagen_url: imagen_url,
    };

    const promise = id
      ? ProductoService.updateProductos(id, producto)
      : ProductoService.createProductos(producto);

    promise
      .then(() => {
        navigate("/administrar"); // Navigate to the new admin page
      })
      .catch((error) => {
        console.error("Error al guardar el producto:", error);
        alert(
          "Hubo un error al guardar el producto. Revisa la consola para más detalles."
        );
      });
  };

  return (
    <div className="admin-container">
      <h2>{id ? "Editar Producto" : "Agregar Producto"}</h2>
      <form onSubmit={saveOrUpdateProducto}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Descripción:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Precio:</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Stock:</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Categoría:</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
          >
            <option value="">Seleccione una categoría</option>
            <option value="motor">Motor</option>
            <option value="frenos">Frenos</option>
            <option value="suspension">Suspensión</option>
            <option value="electrico">Eléctrico</option>
            <option value="neumaticos">Neumáticos</option>
            <option value="filtros">Filtros</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label>Imagen:</label>
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImagenChange}
          />
          {isUploading && <p>Subiendo imagen...</p>}
          {imagen_url && !isUploading && (
            <div className="image-preview">
              <p>Vista previa:</p>
              <img src={imagen_url} alt="Vista previa del producto" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            </div>
          )}
        </div>
        <button type="submit" disabled={isUploading}>{id ? "Actualizar" : "Guardar"}</button>
      </form>
    </div>
  );
};

export default EditarProducto;
