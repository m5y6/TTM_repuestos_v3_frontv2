import categoriasData from '../categorias.json';

const LOCAL_STORAGE_KEY = 'ttm_categorias';

// Cargar datos iniciales si no existen en localStorage
const initializeData = () => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categoriasData));
    }
};

initializeData();

class CategoriaService {
    getCategorias() {
        const categorias = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        return Promise.resolve({ data: categorias });
    }

    createCategoria(categoria) {
        let categorias = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        const newCategoria = {
            id: categorias.length > 0 ? Math.max(...categorias.map(c => c.id)) + 1 : 1,
            ...categoria
        };
        categorias.push(newCategoria);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categorias));
        return Promise.resolve({ data: newCategoria });
    }

    updateCategoria(id, updatedCategoria) {
        let categorias = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        categorias = categorias.map(c => (c.id === id ? { ...c, ...updatedCategoria } : c));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categorias));
        return Promise.resolve({ data: updatedCategoria });
    }

    deleteCategoria(id) {
        let categorias = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        categorias = categorias.filter(c => c.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categorias));
        return Promise.resolve();
    }
}

export default new CategoriaService();
