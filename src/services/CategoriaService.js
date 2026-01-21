import api from './api';

const API_URL = 'http://localhost:8080/api/categorias';

class CategoriaService {
    getCategorias() {
        return api.get(API_URL);
    }

    createCategoria(categoria) {
        return api.post(API_URL, categoria);
    }

    updateCategoria(id, updatedCategoria) {
        return api.put(`${API_URL}/${id}`, updatedCategoria);
    }

    deleteCategoria(id) {
        return api.delete(`${API_URL}/${id}`);
    }
}

export default new CategoriaService();
