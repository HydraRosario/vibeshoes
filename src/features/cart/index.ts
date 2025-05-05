import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Product, ProductWithSelection } from '@/types/product';
import { Cart, CartItem } from '@/types/cart';

const CART_COLLECTION = 'carts';

export const clearCart = async (userId: string): Promise<boolean> => {
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    await deleteDoc(cartRef);
    return true;
  } catch (error) {
    console.error('Error al vaciar el carrito:', error);
    return false;
  }
};

export const getCart = async (userId: string): Promise<Cart | null> => {
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    const cartSnap = await getDoc(cartRef);
    
    if (!cartSnap.exists()) {
      return null;
    }
    
    return cartSnap.data() as Cart;
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    return null;
  }
};

export const addToCart = async (
  userId: string, 
  product: ProductWithSelection, 
  quantity: number
): Promise<boolean> => {
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    const cart = await getCart(userId) || {
      userId,
      items: [],
      total: 0,
      updatedAt: new Date()
    };

    const existingItemIndex = cart.items.findIndex(
      item => item.productId === product.id && item.selectedColor === product.selectedColor && item.selectedSize === product.selectedSize
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        imageUrl: product.imageUrl,
        selectedColor: product.selectedColor,
        selectedSize: product.selectedSize
      });
    }

    cart.total = calculateTotal(cart.items);
    cart.updatedAt = new Date();

    // Convert dates to timestamps for Firestore
    const cartData = {
      ...cart,
      updatedAt: cart.updatedAt.toISOString()
    };

    await setDoc(cartRef, cartData);
    return true;
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    return false;
  }
};

export const removeFromCart = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const cart = await getCart(userId);
    if (!cart) return false;

    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.total = calculateTotal(cart.items);
    cart.updatedAt = new Date();

    const cartRef = doc(db, CART_COLLECTION, userId);
    
    if (cart.items.length === 0) {
      await deleteDoc(cartRef);
    } else {
      // Convert dates to timestamps for Firestore
      const cartData = {
        ...cart,
        updatedAt: cart.updatedAt.toISOString()
      };
      await updateDoc(cartRef, cartData);
    }

    return true;
  } catch (error) {
    console.error('Error al remover del carrito:', error);
    return false;
  }
};

export const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number,
  selectedColor?: string,
  selectedSize?: string | number
): Promise<boolean> => {
  try {
    const cart = await getCart(userId);
    if (!cart) return false;

    const itemIndex = cart.items.findIndex(
      item => item.productId === productId && item.selectedColor === (selectedColor || '') && item.selectedSize === (selectedSize || '')
    );

    if (itemIndex === -1) return false;

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    cart.total = calculateTotal(cart.items);
    cart.updatedAt = new Date();

    const cartRef = doc(db, CART_COLLECTION, userId);
    const cartData = {
      ...cart,
      updatedAt: cart.updatedAt.toISOString()
    };
    await updateDoc(cartRef, cartData);
    return true;
  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    return false;
  }
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};