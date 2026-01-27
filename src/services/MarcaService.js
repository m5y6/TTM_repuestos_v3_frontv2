import api from './api';

class MarcaService {
    getMarcas() {
        return api.get('/api/marcas');
    }

    createMarca(marca) {
        return api.post('/api/marcas', marca);
    }

    updateMarca(id, updatedMarca) {
        return api.put(`/api/marcas/${id}`, updatedMarca);
    }

    deleteMarca(id) {
        return api.delete(`/api/marcas/${id}`);
    }

    updateOrdenMarcas(marcasOrdenadas) {
        return api.put('/api/marcas/orden', marcasOrdenadas);
    }
}

export default new MarcaService();
