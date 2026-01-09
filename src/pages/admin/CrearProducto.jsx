import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductoService from "../../services/ProductoService";
import { uploadFileToS3 } from '../../services/UploadService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import "../../styles/administrar.css";
import categoriasData from '../../categorias.json';
import marcasData from '../../marcas.json';

const CrearProducto = () => {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [description, setDescription] = useState("");
  const [imagen_url, setImagenUrl] = useState("");
  const [procentaje_desc, setProcentajeDesc] = useState("");
  const [marca, setMarca] = useState("");
  const [oem, setOem] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    setCategorias(categoriasData.map(c => c.nombre));
    setMarcas(marcasData.map(m => m.nombre));
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

    const producto = {
      nombre,
      precio: parseFloat(precio),
      categoria,
      description,
      imagen_url: imagen_url,
      procentaje_desc: parseFloat(procentaje_desc),
      marca,
      oem,
    };

    ProductoService.createProductos(producto)
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
      <h2>Agregar Producto</h2>
      <form onSubmit={saveProducto}>
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
          <label>Porcentaje Descuento:</label>
          <input
            type="number"
            value={procentaje_desc}
            onChange={(e) => setProcentajeDesc(e.target.value)}
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
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>Marca:</label>
          <select
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            required
          >
            <option value="">Seleccione una marca</option>
            {marcas.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label>OEM:</label>
          <input
            type="text"
            value={oem}
            onChange={(e) => setOem(e.target.value)}
          />
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
        <button type="submit" disabled={isUploading}>Guardar</button>
      </form>
    </div>
    <Footer />
    </>
  );
};

export default CrearProducto;
