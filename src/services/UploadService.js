import axios from 'axios';

// La URL base de nuestra API desplegada.
// Asegúrate de que el prefijo /api/ esté presente.
const API_BASE_URL = '/api'; 

/**
 * Sube un archivo a S3 usando el nuevo flujo de URL prefirmada.
 * @param {File} file - El objeto File del input (ej: event.target.files[0])
 * @returns {Promise<string>} - La URL pública final del archivo en S3.
 */
export const uploadFileToS3 = async (file) => {
  if (!file) {
    throw new Error("No se ha seleccionado ningún archivo.");
  }

  try {
    // --- PASO 1: Obtener la URL prefirmada de nuestro backend ---
    console.log("Pidiendo URL prefirmada al backend...");
    const response = await axios.post(`${API_BASE_URL}/uploads/generate-presigned-url`, {
      fileName: file.name
    });

    const { url: presignedUrl } = response.data;
    console.log("URL prefirmada recibida:", presignedUrl);

    // --- PASO 2: Subir el archivo directamente a S3 usando la URL ---
    console.log("Subiendo archivo a S3...");
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type // ¡MUY IMPORTANTE! Esto es crucial.
      }
    });

    // La URL final del objeto no es la prefirmada. La construimos nosotros.
    // La URL prefirmada contiene tokens de seguridad temporales.
    const finalFileUrl = presignedUrl.split('?')[0];
    console.log("Archivo subido con éxito. URL final:", finalFileUrl);
    
    return finalFileUrl;

  } catch (error) {
    console.error("Error en el proceso de subida:", error);
    throw error;
  }
};
