import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductoService from "../../services/ProductoService";
import CategoriaService from "../../services/CategoriaService";
import MarcaService from "../../services/MarcaService";
import { uploadFileToS3 } from "../../services/UploadService";
import "../../styles/administrar.css";

const EditarProducto = () => {
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoriaId, setCategoriaId] = useState(""); // Usaremos ID
  const [description, setDescription] = useState("");
  const [imagen_url, setImagenUrl] = useState("");
  const [procentaje_desc, setProcentajeDesc] = useState("");
  const [marcaId, setMarcaId] = useState(""); // Usaremos ID
  const [oem, setOem] = useState("");
  
  // Estados para la UI y datos de soporte
  const [isUploading, setIsUploading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar Marcas y Categorías y el producto a editar
    const cargarDatos = async () => {
      try {
        const [marcasRes, categoriasRes, productoRes] = await Promise.all([
          MarcaService.getMarcas(),
          CategoriaService.getCategorias(),
          ProductoService.getProductoById(id)
        ]);

        setMarcas(marcasRes.data);
        setCategorias(categoriasRes.data);

        const producto = productoRes.data;
        
        // Poblamos el formulario con los datos del producto
        setNombre(producto.nombre);
        setPrecio(producto.precio);
        setDescription(producto.description || "");
        setImagenUrl(producto.imagen_url || "");
        setProcentajeDesc(producto.procentaje_desc || "");
        setOem(producto.oem || "");
        
        // Asignamos los IDs de marca y categoría
        // La API devuelve el objeto completo, accedemos a su 'id'
        setMarcaId(producto.marca.id);
        setCategoriaId(producto.categoria.id);

      } catch (err) {
        console.error("Error al cargar datos para edición:", err);
        alert("No se pudieron cargar los datos del producto.");
        navigate('/admin/ver-productos');
      }
    };

    if (id) {
      cargarDatos();
    } else {
      navigate('/admin/ver-productos');
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

  const updateProducto = async (e) => {
    e.preventDefault();

    const productoActualizado = {
      nombre,
      precio: parseFloat(precio),
      description,
      imagen_url,
      procentaje_desc: parseFloat(procentaje_desc) || 0,
      oem,
      marcaId: parseInt(marcaId),
      categoriaId: parseInt(categoriaId),
    };

    ProductoService.updateProducto(id, productoActualizado)
      .then(() => {
        alert("Producto actualizado con éxito.");
        navigate("/admin/ver-productos");
      })
      .catch((error) => {
        console.error("Error al actualizar el producto:", error);
        alert(
          "Hubo un error al actualizar el producto. Revisa la consola para más detalles."
        );
      });
  };

  return (
    <div className="admin-container">
      <h2>Editar Producto</h2>
      <form onSubmit={updateProducto}>
        <div>
          <label>OEM:</label>
          <input
            type="text"
            value={oem}
            onChange={(e) => setOem(e.target.value)}
          />
        </div>
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
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
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
        <button type="submit" disabled={isUploading}>Actualizar</button>
      </form>
    </div>
  );
};

export default EditarProducto;
