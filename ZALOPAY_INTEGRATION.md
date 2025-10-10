# ZaloPay Integration Test

## API Endpoints

### 1. Create ZaloPay Payment
```bash
POST /api/v1/payments/create
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "amount": 50000,
  "paymentMethod": "zalopay",
  "paymentType": "deposit",
  "description": "Nạp tiền vào ví StudySync qua ZaloPay"
}
```

### 2. ZaloPay Callback Endpoint
```bash
POST /api/v1/payments/zalopay/callback
Content-Type: application/json

{
  "data": "<encrypted_payment_data>",
  "mac": "<hmac_signature>"
}
```

### 3. Health Check
```bash
GET /api/v1/payments/health

Response:
{
  "status": "OK",
  "message": "Payment service is running",
  "timestamp": "2025-10-08T09:20:15.123Z",
  "services": {
    "wallet": "active",
    "vnpay": "configured",
    "momo": "configured",
    "zalopay": "configured",
    "subscription": "active"
  }
}
```

## ZaloPay Configuration (.env)

Make sure these environment variables are set:

```env
# ZaloPay
ZALOPAY_APP_ID=YOUR_APP_ID
ZALOPAY_KEY1=YOUR_KEY1
ZALOPAY_KEY2=YOUR_KEY2
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
ZALOPAY_CALLBACK_URL=http://localhost:3000/api/v1/payments/zalopay/callback
```

## ZaloPay Payment Flow

1. **User creates payment request** via `/api/v1/payments/create`
2. **System generates ZaloPay payment URL** using ZaloPayService
3. **User redirected to ZaloPay** to complete payment
4. **ZaloPay sends callback** to `/api/v1/payments/zalopay/callback`
5. **System verifies signature** and processes payment
6. **Wallet balance updated** if payment successful

## Testing ZaloPay Integration

### Test Payment Creation:
```javascript
const paymentData = {
  amount: 50000,
  paymentMethod: "zalopay",
  paymentType: "deposit",
  description: "Test ZaloPay payment"
};

fetch('/api/v1/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify(paymentData)
});
```

### Expected Response:
```json
{
  "paymentUrl": "https://sbgateway.zalopay.vn/order/...",
  "transactionId": "TXN_123456789",
  "expiresAt": "2025-10-08T10:35:15.123Z",
  "amount": 50000,
  "paymentMethod": "zalopay"
}
```

## Notes

- ZaloPay uses **HMAC-SHA256** for signature verification
- Payment URLs expire after **15 minutes** (configurable)
- All amounts should be in **VND** (Vietnamese Dong)
- Minimum payment: **2,000 VND**
- Maximum payment: **50,000,000 VND**

## Security Features

✅ **HMAC Signature Verification**: All callbacks verified with Key2
✅ **Transaction ID Validation**: Prevents duplicate processing
✅ **Payment Timeout**: Auto-expire after configured time
✅ **Rate Limiting**: Max 10 payment attempts per day
✅ **JWT Authentication**: All endpoints protected
✅ **Input Validation**: Amount limits and data sanitization