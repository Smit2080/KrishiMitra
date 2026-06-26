# Razorpay Payment Integration Setup

## Quick Start

### 1. Get Test Keys

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy your `Key ID` (starts with `rzp_test_`) and `Key Secret`

### 2. Configure Environment

Add to your `.env` file:

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your-secret-here
```

### 3. Start the Backend

```bash
npm run server
```

The server starts on port 4000 and automatically enables Razorpay if keys are present.

### 4. Test a Payment

1. Open the app at `http://localhost:5173`
2. Add items to cart
3. Choose "Online Payment" and click "Pay with Razorpay"
4. Use test card: `4111 1111 1111 1111`, any future expiry, any CVV

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/config` | GET | Check if Razorpay is configured |
| `/api/payments/checkout` | POST | Create a Razorpay order |
| `/api/payments/verify` | POST | Verify payment signature |
| `/api/payments/status/:orderId` | GET | Get payment status |
| `/api/payments` | GET | List payments for a consumer |
| `/api/payments/webhook` | POST | Razorpay webhook receiver |

## Payment Flow

```
Consumer clicks "Pay" → Frontend calls /api/payments/checkout
→ Backend creates Razorpay order → Returns orderId + keyId
→ Frontend opens Razorpay checkout modal
→ User completes payment → Razorpay returns signature
→ Frontend calls /api/payments/verify with signature
→ Backend verifies HMAC-SHA256 signature
→ If valid: order is placed in Supabase
→ Receipt shown to user
```

## Webhook Setup (Optional)

For production, set up webhooks to handle payment events:

1. In Razorpay Dashboard → Webhooks → Add New
2. URL: `https://your-backend.onrender.com/api/payments/webhook`
3. Events: `payment.captured`, `payment.failed`
4. Copy the webhook secret to your `.env`:
   ```
   RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
   ```

## Going Live

1. Switch to Live mode in Razorpay Dashboard
2. Generate Live keys
3. Replace test keys in `.env` with live keys
4. Update webhook URL to production backend
5. Complete KYC on Razorpay Dashboard

## Troubleshooting

- **"Razorpay is not configured"**: Check that both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are in `.env`
- **"Payment verification failed"**: The signature check uses `RAZORPAY_KEY_SECRET` — ensure it matches
- **Checkout modal doesn't open**: Check browser console for script loading errors
- **COD works but online doesn't**: Backend must be running (`npm run server`)
