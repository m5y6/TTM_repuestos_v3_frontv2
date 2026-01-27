import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductoService from "../../services/ProductoService";
import CategoriaService from "../../services/CategoriaService";
import MarcaService from "../../services/MarcaService";
import { uploadFileToS3 } from '../../services/UploadService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import "../../styles/administrar.css";

const CrearProducto = () => {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoriaId, setCategoriaId] = useState(""); // Cambiado a ID
  const [description, setDescription] = useState("");
  const [imagen_url, setImagenUrl] = useState("");
  const [porcentaje_descuento, setPorcentajeDescuento] = useState("");
  const [marcaId, setMarcaId] = useState(""); // Cambiado a ID
  const [oem, setOem] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Cargar categorías y marcas desde los servicios
    CategoriaService.getCategorias()
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Error al cargar categorías:", err));
    
    MarcaService.getMarcas()
      .then(res => setMarcas(res.data))
      .catch(err => console.error("Error al cargar marcas:", err));
  }, []);

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

  const saveProducto = async (e) => {
    e.preventDefault();

    // El backend espera los IDs de marca y categoría
    const producto = {
      nombre,
      precio: parseFloat(precio),
      categoriaId: parseInt(categoriaId),
      description,
      imagen_url,
      porcentaje_descuento: parseFloat(porcentaje_descuento) || 0, // Asegurar que sea un número
      marcaId: parseInt(marcaId),
      oem,
    };

    ProductoService.createProducto(producto)
      .then(() => {
        navigate("/admin/ver-productos");
      })
      .catch((error) => {
        console.error("Error al guardar el producto:", error);
        alert(
          "Hubo un error al guardar el producto. Revisa la consola para más detalles."
        );
      });
  };

  return (
    <>
    <Header />
    <div className="admin-container">
      <h1>Agregar Producto</h1>
      <form onSubmit={saveProducto} className="crear-producto-form">
        <div className="form-group">
          <label>OEM (Opcional):</label>
          <input
            type="text"
            value={oem}
            onChange={(e) => setOem(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Descripción:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Precio:</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Porcentaje Descuento (opcional) (0-100%):</label>
          <input
            type="number"
            value={porcentaje_descuento}
            onChange={(e) => setPorcentajeDescuento(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Categoría:</label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Marca:</label>
          <select
            value={marcaId}
            onChange={(e) => setMarcaId(e.target.value)}
            required
          >
            <option value="">Seleccione una marca</option>
            {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
      
        <div className="form-group">
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
        <div className="form-actions">
          <button type="submit" className="btn-guardar" disabled={isUploading}>Guardar</button>
        </div>
      </form>
    </div>
    <Footer />
    </>
  );
};

export default CrearProducto;
