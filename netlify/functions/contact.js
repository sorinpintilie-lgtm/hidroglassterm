const SENDGRID_ENDPOINT = 'https://api.sendgrid.com/v3/mail/send';

const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  },
  body: JSON.stringify(payload)
});

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const clean = (value = '', maxLength = 1000) => String(value).trim().slice(0, maxLength);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const ccEmail = process.env.CONTACT_CC_EMAIL;
  const siteName = process.env.SITE_NAME || 'Hidro Glass Term';

  if (!apiKey || !fromEmail || !toEmail) {
    return jsonResponse(500, {
      error: 'Email configuration is missing. Check SENDGRID_API_KEY, SENDGRID_FROM_EMAIL and CONTACT_TO_EMAIL.'
    });
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (error) {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const name = clean(data.name, 120);
  const phone = clean(data.phone, 80);
  const city = clean(data.city, 120);
  const service = clean(data.service, 160);
  const message = clean(data.message, 1500);
  const page = clean(data.page, 300);
  const website = clean(data.website, 200); // honeypot field

  if (website) {
    return jsonResponse(200, { ok: true });
  }

  const phoneLooksValid = /^[0-9+\s()-]{8,}$/.test(phone);

  if (!name || !phone || !city || !service) {
    return jsonResponse(400, { error: 'Completează toate câmpurile obligatorii.' });
  }

  if (!phoneLooksValid) {
    return jsonResponse(400, { error: 'Numărul de telefon introdus nu este valid.' });
  }

  const subject = `Cerere nouă formular - ${siteName}`;
  const textContent = [
    `Cerere nouă de pe ${siteName}`,
    '',
    `Nume: ${name}`,
    `Telefon: ${phone}`,
    `Localitate: ${city}`,
    `Serviciu: ${service}`,
    `Pagina: ${page || 'Nespecificată'}`,
    '',
    'Mesaj:',
    message || 'Fără mesaj suplimentar.'
  ].join('\n');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 16px;">Cerere nouă de pe ${escapeHtml(siteName)}</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 640px;">
        <tr><td style="font-weight:700;border:1px solid #e5e7eb;">Nume</td><td style="border:1px solid #e5e7eb;">${escapeHtml(name)}</td></tr>
        <tr><td style="font-weight:700;border:1px solid #e5e7eb;">Telefon</td><td style="border:1px solid #e5e7eb;">${escapeHtml(phone)}</td></tr>
        <tr><td style="font-weight:700;border:1px solid #e5e7eb;">Localitate</td><td style="border:1px solid #e5e7eb;">${escapeHtml(city)}</td></tr>
        <tr><td style="font-weight:700;border:1px solid #e5e7eb;">Serviciu</td><td style="border:1px solid #e5e7eb;">${escapeHtml(service)}</td></tr>
        <tr><td style="font-weight:700;border:1px solid #e5e7eb;">Pagina</td><td style="border:1px solid #e5e7eb;">${escapeHtml(page || 'Nespecificată')}</td></tr>
      </table>
      <h3 style="margin: 20px 0 8px;">Mesaj</h3>
      <p style="white-space: pre-line; background:#f9fafb; border:1px solid #e5e7eb; padding:12px; border-radius:8px;">${escapeHtml(message || 'Fără mesaj suplimentar.')}</p>
    </div>
  `;

  const personalizations = [{ to: [{ email: toEmail }] }];
  if (ccEmail) {
    personalizations[0].cc = ccEmail.split(',').map((email) => ({ email: email.trim() })).filter((entry) => entry.email);
  }

  const payload = {
    personalizations,
    from: {
      email: fromEmail,
      name: siteName
    },
    reply_to: {
      email: fromEmail,
      name
    },
    subject,
    content: [
      { type: 'text/plain', value: textContent },
      { type: 'text/html', value: htmlContent }
    ]
  };

  const response = await fetch(SENDGRID_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    console.error('SendGrid error:', response.status, details);
    return jsonResponse(502, { error: 'Emailul nu a putut fi trimis. Verifică setările SendGrid.' });
  }

  return jsonResponse(200, { ok: true });
};