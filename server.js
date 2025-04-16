 const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const PAYGATE_API_URL = 'https://api.paygate.to/control/wallet.php';
const PAYGATE_CHECKOUT_URL = 'https://checkout.paygate.to/process-payment.php';
const PUBLIC_DOMAIN = 'https://paygate-kz5t.onrender.com';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Generate payment link
app.get('/api/pay', async (req, res) => {
  const wallet = '0x4F7D9e659BE333096469C5DBE595C0525ae39E30';
  const orderId = Date.now();
  const callbackUrl = encodeURIComponent(`${PUBLIC_DOMAIN}/api/payment-callback?orderId=${orderId}`);
  const apiUrl = `${PAYGATE_API_URL}?address=${wallet}&callback=${callbackUrl}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.address_in) {
      return res.status(500).json({ error: 'No address_in returned from PayGate API' });
    }

    const paymentLink = `${PAYGATE_CHECKOUT_URL}?address=${data.address_in}&amount=10&currency=USD&item=Real+Estate+Deposit&orderId=${orderId}&method=card`;
    res.json({ paymentLink });
  } catch (err) {
    console.error('Error fetching PayGate wallet:', err);
    res.status(500).json({ error: 'Could not generate payment link' });
  }
});

// Payment callback
app.get('/api/payment-callback', (req, res) => {
  const { orderId, value_coin } = req.query;
  console.log(`Payment received. Order ID: ${orderId}, Amount: ${value_coin} USDC`);
  res.send('Payment received and processed.');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
