import api from './api';

class CategoriaService {
    getCategorias() {
        return api.get('/api/categorias');
    }

    createCategoria(categoria) {
        return api.post('/api/categorias', categoria);
    }

    updateCategoria(id, updatedCategoria) {
        return api.put(`/api/categorias/${id}`, updatedCategoria);
    }

    deleteCategoria(id) {
        return api.delete(`/api/categorias/${id}`);
    }
}

export default new CategoriaService();
