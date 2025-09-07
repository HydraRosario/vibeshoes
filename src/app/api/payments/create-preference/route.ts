import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, userId, userEmail, userName, items, total } = body as {
      orderId: string;
      userId: string;
      userEmail?: string;
      userName?: string;
      items: Array<{ title: string; quantity: number; unit_price: number; picture_url?: string }>;
      total: number;
    };

    if (!orderId || !userId || !items || !Array.isArray(items) || items.length === 0 || !total) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    // Resolve SITE_URL: prefer explicit env, otherwise infer from request headers in Vercel/Next
    const forwardedProto = (req.headers.get('x-forwarded-proto') || '').split(',')[0]?.trim();
    const host = req.headers.get('host');
    const inferredOrigin = forwardedProto && host ? `${forwardedProto}://${host}` : undefined;
    const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || inferredOrigin || 'http://localhost:3000';
    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Mercado Pago not configured' }, { status: 501 });
    }

    const { MercadoPagoConfig, Preference } = await import('mercadopago');
    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

    const preferencePayload: any = {
      items: items.map(i => ({
        title: i.title,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        currency_id: 'ARS',
        picture_url: i.picture_url,
      })),
      payer: {
        email: userEmail,
        name: userName,
      },
      back_urls: {
        success: `${SITE_URL}/checkout/success?orderId=${orderId}`,
        failure: `${SITE_URL}/checkout/failure?orderId=${orderId}`,
        pending: `${SITE_URL}/checkout/pending?orderId=${orderId}`,
      },
      auto_return: 'approved',
      notification_url: `${SITE_URL}/api/webhooks/mercadopago`,
      external_reference: orderId,
    };

    const preference = new Preference(client);
    let prefRes: any;
    try {
      prefRes = await preference.create({ body: preferencePayload } as any);
    } catch (sdkErr: any) {
      console.error('MercadoPago Preference.create error:', {
        message: sdkErr?.message,
        cause: sdkErr?.cause,
        status: sdkErr?.status,
        error: sdkErr,
      });
      return NextResponse.json({ error: 'MP Preference error', message: sdkErr?.message, status: sdkErr?.status }, { status: 500 });
    }

    const init_point = prefRes.init_point || prefRes.sandbox_init_point || (prefRes.body && (prefRes.body.init_point || prefRes.body.sandbox_init_point));
    const id = prefRes.id || (prefRes.body && prefRes.body.id);

    return NextResponse.json({ init_point, id, orderId });
  } catch (err: any) {
    console.error('create-preference error:', err);
    return NextResponse.json({ error: 'Server error', message: err?.message }, { status: 500 });
  }
}
