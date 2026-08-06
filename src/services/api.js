const API_URL = 'http://localhost:5000/api';

// Obtener todos los productos
export const getProducts = async () => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) throw new Error('Error al obtener productos');
  return response.json();
};

// Obtener todas las categorías
export const getCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error('Error al obtener categorías');
  return response.json();
};

// Crear un nuevo producto
export const createProduct = async (productData) => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Error al crear producto');
  return response.json();
};

// Actualizar / Editar un producto
export const updateProduct = async (id, productData) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Error al actualizar el producto');
  return response.json();
};

// Eliminar un producto
export const deleteProduct = async (id) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar el producto');
  return response.json();
};