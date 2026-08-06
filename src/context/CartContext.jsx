import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // 1. Cargar el carrito desde localStorage al iniciar
  const [cart, setCart] = useState(() => {
    try {
      const localData = localStorage.getItem('botines_cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error('Error al recuperar el carrito de localStorage:', error);
      return [];
    }
  });

  // 2. Guardar en localStorage automáticamente ante cualquier cambio
  useEffect(() => {
    try {
      localStorage.setItem('botines_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error al guardar el carrito en localStorage:', error);
    }
  }, [cart]);

  // Agregar al carrito
  const addToCart = (product, selectedSize) => {
    if (!selectedSize) {
      alert('Por favor, seleccioná un talle antes de agregar al carrito.');
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prevCart, { ...product, selectedSize, quantity: 1 }];
    });
  };

  // Quitar un producto específico con su talle
  const removeFromCart = (id, selectedSize) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.selectedSize === selectedSize)));
  };

  // Vaciar carrito
  const clearCart = () => setCart([]);

  // Calcular precio total
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
  };

  // Enviar pedido por WhatsApp
  const sendToWhatsApp = (phoneNumber = '5491112345678') => {
    if (cart.length === 0) return;

    let message = '¡Hola! Quiero realizar el siguiente pedido en *Botines FB9*:\n\n';

    cart.forEach((item) => {
      message += `• *${item.title}*\n  Talle: ${item.selectedSize} | Cantidad: ${item.quantity} | Precio: $${Number(item.price).toLocaleString('es-AR')}\n`;
    });

    message += `\n*Total a pagar:* $${getTotalPrice().toLocaleString('es-AR')}\n\n¿Cómo coordinamos el pago y envío?`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getTotalPrice, sendToWhatsApp }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);