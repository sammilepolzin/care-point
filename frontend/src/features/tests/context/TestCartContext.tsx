import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartTestItem {
  _id: string;
  name: string;
  code: string;
  category: string;
  regularPrice: number;
  discountPrice: number;
  preparationInstructions?: string;
  sampleType?: string;
  reportDeliveryTime?: string;
  homeCollectionAvailable?: boolean;
}

interface TestCartContextType {
  cartItems: CartTestItem[];
  addToCart: (test: CartTestItem) => void;
  removeFromCart: (testId: string) => void;
  clearCart: () => void;
  isInCart: (testId: string) => boolean;
  totalRegularPrice: number;
  totalDiscountPrice: number;
  totalSavings: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const TestCartContext = createContext<TestCartContextType | undefined>(undefined);

export const TestCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartTestItem[]>(() => {
    try {
      const saved = localStorage.getItem('carepoint_test_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('carepoint_test_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (test: CartTestItem) => {
    if (!isInCart(test._id)) {
      setCartItems((prev) => [...prev, test]);
    }
  };

  const removeFromCart = (testId: string) => {
    setCartItems((prev) => prev.filter((item) => item._id !== testId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (testId: string) => {
    return cartItems.some((item) => item._id === testId);
  };

  const totalRegularPrice = cartItems.reduce((sum, item) => sum + item.regularPrice, 0);
  const totalDiscountPrice = cartItems.reduce((sum, item) => sum + item.discountPrice, 0);
  const totalSavings = Math.max(0, totalRegularPrice - totalDiscountPrice);

  return (
    <TestCartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        totalRegularPrice,
        totalDiscountPrice,
        totalSavings,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </TestCartContext.Provider>
  );
};

export const useTestCart = () => {
  const context = useContext(TestCartContext);
  if (!context) {
    throw new Error('useTestCart must be used within a TestCartProvider');
  }
  return context;
};