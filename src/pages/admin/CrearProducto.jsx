import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductoService from "../../services/ProductoService";
import CategoriaService from "../../services/CategoriaService";
import MarcaService from "../../services/MarcaService";
import { uploadFileToS3 } from '../../services/UploadService';
import Header from '../../organisms/Header';
import Footer from '../../organisms/Footer';
import "../../styles/administrar.css";
import '../../styles/VerProductos.css';

const CrearProducto = () => {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoriaId, setCategoriaId] = useState(""); // Cambiado a ID
  const [description, setDescription] = useState("");
  const [imagen_url, setImagenUrl] = useState("");
  const [porcentaje_descuento, setPorcentajeDescuento] = useState("");
  const [marcaId, setMarcaId] = useState(""); // Cambiado a ID
  const [oem, setOem] = useState("");
  const [codigo_producto, setCodigoProducto] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imagen, setImagen] = useState({ preview: "", file: null }); // Para preview y archivo
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [imagenError, setImagenError] = useState("");

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

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    setImagenError("");
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10 MB
        setImagenError("El archivo excede el peso permitido de 10 MB.");
        setImagen({ preview: "", file: null });
        e.target.value = ""; // Limpiar el input
        return;
      }

      setImagen({
        preview: URL.createObjectURL(file),
        file: file,
      });
    }
  };

  const saveProducto = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalImageUrl = '';
      // 1. Subir la imagen si existe
      if (imagen.file) {
        finalImageUrl = await uploadFileToS3(imagen.file);
      }

      // 2. Preparar los datos del producto
      const producto = {
        nombre,
        precio: parseFloat(precio),
        categoriaId: parseInt(categoriaId),
        description,
        imagen_url: finalImageUrl,
        porcentaje_descuento: parseFloat(porcentaje_descuento) || 0,
        marcaId: parseInt(marcaId),
        oem,
        codigo_producto,
      };

      // 3. Crear el producto
      await ProductoService.createProducto(producto);
      
      // Liberar el objeto URL de la vista previa
      if (imagen.preview) {
        URL.revokeObjectURL(imagen.preview);
      }

      navigate("/admin/ver-productos");

    } catch (error) {
      console.error("Error al guardar el producto:", error);
      alert("Hubo un error al guardar el producto. Revisa la consola.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <Header />
    <div className="admin-container crear-producto-container">
      <h1>Agregar Producto</h1>
      <form onSubmit={saveProducto} className="crear-producto-form">
        <div className="form-group">
          <label>OEM (Opcional):</label>
          <input
            type="text"
            value={oem}
            onChange={(e) => setOem(e.target.value)}
            maxLength="22"
          />
          <div className="char-counter">
            {oem.length}/22
          </div>
        </div>
        <div className="form-group">
          <label>Código Producto (Opcional):</label>
          <input
            type="text"
            value={codigo_producto}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              if (value.length === 3 && codigo_producto.length < 3) {
                setCodigoProducto(value + "-");
              } else {
                setCodigoProducto(value);
              }
            }}
            maxLength="10"
            pattern="[A-Z0-9]{3}-[A-Z0-9]{1,6}"
            title="El formato debe ser de 3 letras/números, un guión, y de 1 a 6 letras/números (ej. ART-122222)."
          />
          <div className="char-counter">
            {codigo_producto.length}/10
          </div>
        </div>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            maxLength="20"
          />
          <div className="char-counter">
            {nombre.length}/20
          </div>
        </div>
        <div className="form-group">
          <label>Descripción (Opcional):</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength="30"
          />
          <div className="char-counter">
            {description.length}/30
          </div>
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
          {imagenError && <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>{imagenError}</small>}
          {isSaving && <p>Guardando producto...</p>}
          {imagen.preview && !isSaving && (
            <div className="image-preview">
              <p>Vista previa:</p>
              <img src={imagen.preview} alt="Vista previa del producto" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            </div>
          )}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-guardar" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
    <Footer />
    </>
  );
};

export default CrearProducto;
