import marcasData from '../marcas.json';

const LOCAL_STORAGE_KEY = 'ttm_marcas';

// Cargar datos iniciales si no existen en localStorage
const initializeData = () => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(marcasData));
    }
};

initializeData();

class MarcaService {
    getMarcas() {
        const marcas = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        return Promise.resolve({ data: marcas });
    }

    createMarca(marca) {
        let marcas = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        const newMarca = {
            id: marcas.length > 0 ? Math.max(...marcas.map(m => m.id)) + 1 : 1,
            ...marca
        };
        marcas.push(newMarca);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(marcas));
        return Promise.resolve({ data: newMarca });
    }

    updateMarca(id, updatedMarca) {
        let marcas = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        marcas = marcas.map(m => (m.id === id ? { ...m, ...updatedMarca } : m));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(marcas));
        return Promise.resolve({ data: updatedMarca });
    }

    deleteMarca(id) {
        let marcas = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        marcas = marcas.filter(m => m.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(marcas));
        return Promise.resolve();
    }
}

export default new MarcaService();
