import fetch from 'node-fetch';

const payload = {
  type: 'user.created',
  data: {
    id: 'manual123',
    email_addresses: [{ email_address: 'manual@example.com' }],
    first_name: 'Manual',
    last_name: 'Test',
    image_url: 'https://example.com/avatar.png'
  }
};

const send = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/clerk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('status', res.status);
    console.log('response', text);
  } catch (err) {
    console.error('error', err);
  }
};

send();