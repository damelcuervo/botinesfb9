import React from 'react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, getTotalPrice, sendToWhatsApp } = useCart();

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Tu Carrito</h2>
            <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>

          {cart.length === 0 ? (
            <p style={{ color: '#64748b' }}>El carrito está vacío.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{item.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Talle: {item.selectedSize} | x{item.quantity}</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#16a34a' }}>${(Number(item.price) * item.quantity).toLocaleString('es-AR')}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.selectedSize)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>
              <span>Total:</span>
              <span style={{ color: '#16a34a' }}>${getTotalPrice().toLocaleString('es-AR')}</span>
            </div>

            <button
              onClick={() => sendToWhatsApp('5491112345678')} // Cambiá este número
              style={{ width: '100%', padding: '14px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' }}
            >
              📲 Finalizar Pedido por WhatsApp
            </button>
          </div>
        )}

      </div>
    </div>
  );
}