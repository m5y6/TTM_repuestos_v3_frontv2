import api from './api';

const API_URL = 'http://localhost:8080/api/marcas';

class MarcaService {
    getMarcas() {
        return api.get(API_URL);
    }

    createMarca(marca) {
        return api.post(API_URL, marca);
    }

    updateMarca(id, updatedMarca) {
        return api.put(`${API_URL}/${id}`, updatedMarca);
    }

    deleteMarca(id) {
        return api.delete(`${API_URL}/${id}`);
    }
}

export default new MarcaService();
