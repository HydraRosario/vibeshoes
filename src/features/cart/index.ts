import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Product } from '@/types/product';
import { Cart, CartItem } from '@/types/cart';

const CART_COLLECTION = 'carts';

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
  product: Product, 
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
      item => item.productId === product.id
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        imageUrl: product.imageUrl || ''
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
  quantity: number
): Promise<boolean> => {
  try {
    const cart = await getCart(userId);
    if (!cart) return false;

    const itemIndex = cart.items.findIndex(
      item => item.productId === productId
    );

    if (itemIndex === -1) return false;

    if (quantity <= 0) {
      return removeFromCart(userId, productId);
    }

    cart.items[itemIndex].quantity = quantity;
    cart.total = calculateTotal(cart.items);
    cart.updatedAt = new Date();

    const cartRef = doc(db, CART_COLLECTION, userId);
    
    // Convert dates to timestamps for Firestore
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