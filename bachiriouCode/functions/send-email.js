export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

const { fullName, phone, wilaya, commune, quantity, price, deliveryType } = data;

if (!fullName || !phone || !wilaya || !commune || !quantity || !price || !deliveryType) {
  return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
}

  const phonePattern = /^0[5-7][0-9]{8}$/;
  if (!phonePattern.test(phone)) {
    return new Response(JSON.stringify({ error: 'Invalid phone number' }), { status: 400 });
  }

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1 || qty > 20) {
    return new Response(JSON.stringify({ error: 'Invalid quantity' }), { status: 400 });
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Fit Crunch Orders <onboarding@resend.dev>',
        to: ['aliloubach2004@gmail.com'],
        subject: `طلب جديد من ${fullName}`,
        html: `
          <h2>طلب جديد</h2>
          <p><strong>الاسم:</strong> ${fullName}</p>
          <p><strong>الهاتف:</strong> ${phone}</p>
          <p><strong>الولاية:</strong> ${wilaya}</p>
          <p><strong>البلدية:</strong> ${commune}</p>
          <p><strong>الكمية:</strong> ${qty}</p>
          <p><strong>السعر:</strong> ${price}</p>
          <p><strong>طريقة التوصيل:</strong> ${deliveryType}</p>    
        `,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend error:', errText);
      return new Response(JSON.stringify({ error: 'Email service failed' }), { status: 502 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Server error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}