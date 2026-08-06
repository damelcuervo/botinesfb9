import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from './services/api';
import { ShoppingBag, Search, MessageCircle, Truck, ShieldCheck, X, Plus, Minus, Trash2, Eye } from 'lucide-react';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado del Carrito
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Estado del Modal de Detalle
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const PHONE_NUMBER = '5491112345678';

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSelectSize = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product) => {
    const size = selectedSizes[product.id];
    if (!size) {
      alert('Por favor, selecciona un talle antes de agregar al carrito.');
      return;
    }

    const cartItemId = `${product.id}-${size}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            cartItemId,
            id: product.id,
            title: product.title,
            price: Number(product.price),
            size,
            image: product.images[0]?.url,
            quantity: 1
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;

    let itemsSummary = cart
      .map(
        (item) =>
          `• *${item.title}* (Talle ${item.size}) x${item.quantity} - $${(item.price * item.quantity).toLocaleString('es-AR')}`
      )
      .join('\n');

    const message = encodeURIComponent(
      `Hola! Quisiera realizar el siguiente pedido:\n\n${itemsSummary}\n\n*Total a pagar:* $${cartTotal.toLocaleString('es-AR')}\n\n¿Tienen stock para coordinar la entrega?`
    );

    window.open(`https://wa.me/${PHONE_NUMBER}?text=${message}`, '_blank');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      {/* Topbar */}
      <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '6px 12px', textAlign: 'center', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <span><Truck size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Envíos a todo el país</span>
        <span><ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Productos 100% Originales</span>
      </div>

      {/* Navbar */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
              BOTINES <span style={{ color: '#2563eb' }}>FB9</span>
            </h1>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar botines, marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Botones de Admin y Carrito */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/admin" style={{ textDecoration: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              Admin
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px' }}
            >
              <ShoppingBag size={26} color="#0f172a" />
              {totalItemsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-4px',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Grid de Productos */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.75rem', margin: '0 0 8px 0' }}>Catálogo Oficial</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Hacé clic en un producto para ver el detalle completo o sumalo directamente al carrito.</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0' }}>Cargando catálogo...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filteredProducts.map((product) => {
              const currentSelectedSize = selectedSizes[product.id];

              return (
                <div key={product.id} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div 
                    onClick={() => openProductModal(product)}
                    style={{ position: 'relative', backgroundColor: '#f1f5f9', height: '220px', cursor: 'pointer' }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      zIndex: 1
                    }}>
                      {product.brand?.name}
                    </span>
                    <button style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      zIndex: 1
                    }}>
                      <Eye size={16} color="#0f172a" />
                    </button>
                    <img
                      src={product.images[0]?.url || 'https://via.placeholder.com/300'}
                      alt={product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h3 
                        onClick={() => openProductModal(product)} 
                        style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        {product.title}
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                        {product.description}
                      </p>
                    </div>

                    <div>
                      <div style={{ margin: '12px 0' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16a34a' }}>
                          ${Number(product.price).toLocaleString('es-AR')}
                        </span>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                          Seleccionar Talle:
                        </span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {product.variants.map((v) => {
                            const isSelected = currentSelectedSize === v.size;
                            return (
                              <button
                                key={v.id}
                                onClick={() => handleSelectSize(product.id, v.size)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                                  color: isSelected ? '#2563eb' : '#334155',
                                  fontWeight: isSelected ? '700' : '500',
                                  fontSize: '0.85rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {v.size}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        style={{
                          width: '100%',
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '0.95rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <ShoppingBag size={18} /> Agregar al Carrito
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL DE DETALLE DE PRODUCTO */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '800px', width: '100%', overflow: 'hidden', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            <button
              onClick={() => setSelectedProduct(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={20} color="#0f172a" />
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', overflowY: 'auto' }}>
              
              {/* Galería de fotos */}
              <div style={{ padding: '24px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={selectedProduct.images[activeImageIndex]?.url || selectedProduct.images[0]?.url || 'https://via.placeholder.com/400'}
                  alt={selectedProduct.title}
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '12px' }}
                />
                
                {selectedProduct.images.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    {selectedProduct.images.map((img, idx) => (
                      <img
                        key={img.id || idx}
                        src={img.url}
                        alt="Miniatura"
                        onClick={() => setActiveImageIndex(idx)}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          border: activeImageIndex === idx ? '2px solid #2563eb' : '1px solid #cbd5e1'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Información y Compra */}
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {selectedProduct.brand?.name} • {selectedProduct.category?.name}
                  </span>
                  <h2 style={{ margin: '8px 0 12px 0', fontSize: '1.6rem', fontWeight: '800' }}>{selectedProduct.title}</h2>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                    {selectedProduct.description}
                  </p>

                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#16a34a', marginBottom: '20px' }}>
                    ${Number(selectedProduct.price).toLocaleString('es-AR')}
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>
                      Talles y Stock disponible:
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {selectedProduct.variants.map((v) => {
                        const isSelected = selectedSizes[selectedProduct.id] === v.size;
                        return (
                          <button
                            key={v.id}
                            onClick={() => handleSelectSize(selectedProduct.id, v.size)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                              backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                              color: isSelected ? '#2563eb' : '#334155',
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              cursor: 'pointer'
                            }}
                          >
                            Talle {v.size} <small style={{ fontWeight: '400', opacity: 0.8 }}>(Stock: {v.stock})</small>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <ShoppingBag size={20} /> Agregar al Carrito
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Drawer del Carrito */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Tu Carrito ({totalItemsCount})</h3>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={22} color="#64748b" />
              </button>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <ShoppingBag size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                    <img src={item.image} alt={item.title} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: '700' }}>{item.title}</h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#64748b' }}>Talle: <strong>{item.size}</strong></p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', color: '#16a34a', fontSize: '0.95rem' }}>
                          ${(item.price * item.quantity).toLocaleString('es-AR')}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 6px' }}>
                          <button onClick={() => updateQuantity(item.cartItemId, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <Minus size={14} />
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <Plus size={14} />
                          </button>
                        </div>

                        <button onClick={() => removeFromCart(item.cartItemId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.2rem', fontWeight: '800' }}>
                  <span>Total:</span>
                  <span style={{ color: '#16a34a' }}>${cartTotal.toLocaleString('es-AR')}</span>
                </div>
                <button
                  onClick={handleCheckoutWhatsApp}
                  style={{
                    width: '100%',
                    backgroundColor: '#25d366',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <MessageCircle size={20} /> Enviar Pedido por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;