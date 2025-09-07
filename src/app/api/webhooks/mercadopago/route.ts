import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';

// Mercado Pago Webhook: https://your-site/api/webhooks/mercadopago
// We rely on notification_url configured in each Preference and/or global webhook config
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type'); // e.g., 'payment'
    const dataId = url.searchParams.get('data.id');

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_ACCESS_TOKEN) return NextResponse.json({ error: 'MP not configured' }, { status: 501 });

    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const { MercadoPagoConfig, Payment } = await import('mercadopago');
    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: String(dataId) });

    const externalRef = (payment as any).external_reference as string | undefined; // orderId
    const status = (payment as any).status as string | undefined; // approved, rejected, pending

    if (!externalRef) {
      return NextResponse.json({ error: 'No external_reference' }, { status: 400 });
    }

    const orderRef = doc(db, 'orders', externalRef);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Map MP status to our order status
    let newStatus: 'pendiente' | 'aceptado' | 'rechazado' = 'pendiente';
    if (status === 'approved') newStatus = 'aceptado';
    else if (status === 'rejected') newStatus = 'rechazado';

    // Update order with payment data
    await updateDoc(orderRef, {
      status: newStatus,
      paymentId: String((payment as any).id),
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    });

    // On approval: decrement product variation stock and clear user's cart
    if (status === 'approved') {
      const orderData: any = orderSnap.data();
      const items: Array<{ productId: string; quantity: number; selectedColor?: string }> = orderData.items || [];
      const userId: string = orderData.userId;

      for (const item of items) {
        if (!item.productId) continue;
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) continue;
        const productData: any = productSnap.data();
        if (!Array.isArray(productData.variations)) continue;

        const variations = productData.variations.map((v: any) => ({ ...v }));
        const idx = variations.findIndex((v: any) => v.color === item.selectedColor);
        if (idx >= 0) {
          const currentStock = Number(variations[idx].stock || 0);
          const newStock = Math.max(0, currentStock - Number(item.quantity || 0));
          variations[idx].stock = newStock;
        }
        await updateDoc(productRef, { variations, updatedAt: new Date().toISOString() });
      }

      // Clear cart
      if (userId) {
        const cartRef = doc(db, 'carts', userId);
        try { await deleteDoc(cartRef); } catch {}
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('mercadopago webhook error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
