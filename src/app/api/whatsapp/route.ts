import { NextResponse } from 'next/server';

// POST /api/whatsapp
// Body: { to: string, text: string }
export async function POST(request: Request) {
  try {
    const { to, text } = await request.json();

    if (!to || !text) {
      return NextResponse.json({ error: 'Missing to or text' }, { status: 400 });
    }

    const token = process.env.WHATSAPP_TOKEN; // Permanent token from Meta
    const phoneId = process.env.WHATSAPP_PHONE_ID; // Phone number ID from Meta

    if (!token || !phoneId) {
      return NextResponse.json({ error: 'WhatsApp Cloud API not configured' }, { status: 501 });
    }

    // Sanitize phone (remove spaces and non-digits)
    const toNumber = String(to).replace(/\D/g, '');

    const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toNumber,
        type: 'text',
        text: { body: text }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('WhatsApp API error:', data);
      return NextResponse.json({ error: 'WhatsApp API error', details: data }, { status: 502 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error('WhatsApp API route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
