import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('ALL');
  const [selectedSizes, setSelectedSizes] = useState({}); // Talle elegido por producto { productId: '41' }

  const { addToCart } = useCart();

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setFilteredProducts(data);
    });
  }, []);

  // Filtrar productos por marca o talle
  useEffect(() => {
    let result = products;

    if (selectedBrand !== 'ALL') {
      result = result.filter((p) => p.brand?.name?.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (selectedSizeFilter !== 'ALL') {
      result = result.filter((p) =>
        p.variants?.some((v) => String(v.size) === String(selectedSizeFilter) && Number(v.stock) > 0)
      );
    }

    setFilteredProducts(result);
  }, [selectedBrand, selectedSizeFilter, products]);

  const handleSelectSize = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Barra de Filtros */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '12px' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Marca:</label>
          <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="ALL">Todas las marcas</option>
            <option value="Nike">Nike</option>
            <option value="Adidas">Adidas</option>
            <option value="Puma">Puma</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Talle:</label>
          <select value={selectedSizeFilter} onChange={(e) => setSelectedSizeFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="ALL">Todos los talles</option>
            {[38, 39, 40, 41, 42, 43, 44, 45].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Productos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
        {filteredProducts.map((p) => {
          const currentSize = selectedSizes[p.id] || '';
          const imageUrl = p.images?.[0]?.url || p.images?.[0] || 'https://via.placeholder.com/300';

          return (
            <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <img src={imageUrl} alt={p.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              
              <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{p.brand?.name || 'Botines'}</span>
                  <h3 style={{ margin: '4px 0 8px 0', fontSize: '1.1rem', fontWeight: '800' }}>{p.title}</h3>
                  <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#16a34a', margin: '0 0 12px 0' }}>
                    ${Number(p.price).toLocaleString('es-AR')}
                  </p>
                </div>

                {/* Seleccionar Talle */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Seleccionar Talle:</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {p.variants?.map((v) => {
                      const hasStock = Number(v.stock) > 0;
                      const isSelected = currentSize === v.size;

                      return (
                        <button
                          key={v.size}
                          disabled={!hasStock}
                          onClick={() => handleSelectSize(p.id, v.size)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: isSelected ? '2px solid #0f172a' : '1px solid #cbd5e1',
                            backgroundColor: isSelected ? '#0f172a' : hasStock ? '#fff' : '#f1f5f9',
                            color: isSelected ? '#fff' : hasStock ? '#0f172a' : '#94a3b8',
                            cursor: hasStock ? 'pointer' : 'not-allowed',
                            fontSize: '0.8rem',
                            fontWeight: '700'
                          }}
                        >
                          {v.size}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => addToCart(p, currentSize)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    🛒 Agregar al Carrito
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}