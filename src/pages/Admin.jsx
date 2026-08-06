import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { Plus, Trash2, Edit, Upload, X, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    title: '',
    brandName: '',
    price: '',
    description: '',
    images: [], // URLs de imágenes
    variants: [{ size: '', stock: '' }] // Talles y stock
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manejar inputs simples
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar Subida de Imágenes a Cloudinary via Backend
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      setUploadingImage(true);
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: data,
      });

      const resData = await res.json();
      if (res.ok && resData.url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, resData.url]
        }));
      } else {
        alert('Error al subir la imagen.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al subir imagen.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Quitar una imagen de la lista del formulario
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Manejar variantes de Talles y Stock
  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = value;
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: '', stock: '' }]
    });
  };

  const handleRemoveVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, idx) => idx !== index)
    });
  };

  // Iniciar edición de producto
  const handleEditClick = (product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title || '',
      brandName: product.brand?.name || '',
      price: product.price || '',
      description: product.description || '',
      images: product.images ? product.images.map(img => img.url || img) : [],
      variants: product.variants?.length 
        ? product.variants.map(v => ({ size: v.size, stock: v.stock })) 
        : [{ size: '', stock: '' }]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      brandName: '',
      price: '',
      description: '',
      images: [],
      variants: [{ size: '', stock: '' }]
    });
  };

  // Guardar (Crear o Modificar)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      alert('Por favor, subí al menos una foto del botín.');
      return;
    }

    try {
      if (editingId) {
        await updateProduct(editingId, formData);
        alert('Botín actualizado con éxito.');
      } else {
        await createProduct(formData);
        alert('Botín creado con éxito.');
      }
      handleCancelEdit();
      loadProducts();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el producto.');
    }
  };

  // Eliminar producto
  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que querés eliminar este botín del catálogo?')) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (err) {
        console.error(err);
        alert('Error al eliminar producto.');
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>Panel de Control — Botines FB9</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Carga, edición y gestión de stock del catálogo.</p>
          </div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: '600' }}>
            <ArrowLeft size={18} /> Volver a la Tienda
          </Link>
        </div>

        {/* Formulario */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', fontWeight: '700' }}>
            {editingId ? '✏️ Editar Botín' : '➕ Agregar Nuevo Botín'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Título / Modelo</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Ej: Nike Mercurial Vapor 15"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Marca</label>
                <input
                  type="text"
                  name="brandName"
                  placeholder="Ej: Nike, Adidas, Puma"
                  value={formData.brandName}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Precio ($ ARS)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Ej: 125000"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Descripción</label>
              <textarea
                name="description"
                placeholder="Detalles sobre tapones, gama, suela, etc."
                value={formData.description}
                onChange={handleChange}
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            {/* Subida de Imágenes */}
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
                Fotos del Producto (Cloudinary)
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <label style={{ cursor: 'pointer', backgroundColor: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={16} /> Subir Imagen desde la PC
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                </label>
                {uploadingImage && <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Subiendo archivo...</span>}
              </div>

              {/* Previsualización de imágenes */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {formData.images.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img src={url} alt="Preview" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Talles y Stock */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
                Talles y Stock Disponible
              </label>
              {formData.variants.map((v, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Talle (Ej: 41)"
                    value={v.size}
                    onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                    style={{ width: '120px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                    style={{ width: '120px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  {formData.variants.length > 1 && (
                    <button type="button" onClick={() => handleRemoveVariant(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddVariant}
                style={{ backgroundColor: 'transparent', border: '1px dashed #2563eb', color: '#2563eb', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}
              >
                <Plus size={14} /> Agregar otro talle
              </button>
            </div>

            {/* Botones de Acción */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
              >
                {editingId ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{ backgroundColor: '#cbd5e1', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Listado de Productos */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: '700' }}>Catálogo Actual ({products.length})</h2>

          {loading ? (
            <p style={{ color: '#64748b' }}>Cargando catálogo...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                    <th style={{ padding: '10px' }}>Imagen</th>
                    <th style={{ padding: '10px' }}>Producto</th>
                    <th style={{ padding: '10px' }}>Marca</th>
                    <th style={{ padding: '10px' }}>Precio</th>
                    <th style={{ padding: '10px' }}>Talles</th>
                    <th style={{ padding: '10px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px' }}>
                        {p.images?.[0] ? (
                          <img src={p.images[0].url || p.images[0]} alt={p.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', backgroundColor: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={20} color="#94a3b8" />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px', fontWeight: '600' }}>{p.title}</td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{p.brand?.name || '-'}</td>
                      <td style={{ padding: '10px', fontWeight: '700', color: '#16a34a' }}>
                        ${Number(p.price).toLocaleString('es-AR')}
                      </td>
                      <td style={{ padding: '10px', fontSize: '0.85rem' }}>
                        {p.variants?.map((v) => `${v.size} (${v.stock})`).join(', ') || 'Sin stock'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditClick(p)} style={{ border: 'none', background: '#f1f5f9', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#2563eb' }}>
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} style={{ border: 'none', background: '#fef2f2', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                        No hay botines guardados en la base de datos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}