import { db } from '@/lib/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, getDoc, query, where } from 'firebase/firestore';
import { Order, OrderItem } from '@/types/order';
import { Cart } from '@/types/cart';

const ORDERS_COLLECTION = 'orders';

export const createOrder = async (
  userId: string,
  cart: Cart,
  shippingAddress: Order['shippingAddress']
): Promise<Order | null> => {
  try {
    const now = new Date();
    const orderData: Omit<Order, 'id'> = {
      userId,
      items: cart.items.map((item): OrderItem => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      total: cart.total,
      status: 'pending',
      shippingAddress,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });

    return {
      id: docRef.id,
      ...orderData
    };
  } catch (error) {
    console.error('Error al crear orden:', error);
    return null;
  }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      return null;
    }
    
    const data = orderSnap.data();
    return {
      id: orderSnap.id,
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    } as Order;
  } catch (error) {
    console.error('Error al obtener orden:', error);
    return null;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      } as Order;
    });
  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error);
    return [];
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status']
): Promise<boolean> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const now = new Date();
    await updateDoc(orderRef, {
      status,
      updatedAt: now.toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar estado de la orden:', error);
    return false;
  }
};

export const getOrdersByStatus = async (status: Order['status']): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', status)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      } as Order;
    });
  } catch (error) {
    console.error('Error al obtener órdenes por estado:', error);
    return [];
  }
};