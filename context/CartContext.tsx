import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the types
interface CartItem {
  id: string;
  quantity: number;
  price?: number;
  discount?: number;
  discountedTotal?: number;
  [key: string]: any;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  calculateTotal: () => number;
  clearCart: () => void;
  clearCartstorage: () => void;
  getDetailedCartItems: () => CartItem[];
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart items from AsyncStorage
  useEffect(() => {
    const loadCart = async () => {
      const storedCart = await AsyncStorage.getItem('cartItems');
      if (storedCart) setCartItems(JSON.parse(storedCart));
    };
    loadCart();
  }, []);

  // Save cart items to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add product to the cart
  const addToCart = (product: CartItem) => {
    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  // Remove product from the cart
  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // Increment item quantity
  const incrementQuantity = (id: string) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrement item quantity
  const decrementQuantity = (id: string) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Clear cart in storage
  const clearCartstorage = async () => {
    try {
      await AsyncStorage.removeItem('cartItems');
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  // Get cart items with discounts applied
  const getDetailedCartItems = (): CartItem[] => {
    return cartItems.map((item) => {
      const price = item.price || 0;
      const quantity = item.quantity;
      const isEligibleForDiscount = quantity >= 3;
      const discountRate = isEligibleForDiscount ? 0.1 : 0;

      const discount = price * quantity * discountRate;
      const discountedTotal = price * quantity - discount;

      return {
        ...item,
        discount,
        discountedTotal,
      };
    });
  };

  // Calculate total from discounted totals
  const calculateTotal = (): number => {
    return getDetailedCartItems().reduce(
      (total, item) => total + (item.discountedTotal || 0),
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        calculateTotal,
        clearCart,
        clearCartstorage,
        getDetailedCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
