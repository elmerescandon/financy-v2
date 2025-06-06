# 📱 Financy Integration Examples

## API Overview

**Base URL:** `https://your-domain.com/api/integrations`
**Authentication:** JWT Bearer Token

## 🍎 iPhone Shortcuts

### 1. Quick Expense via Siri

**Voice Command:** "Hey Siri, gasto 15 euros en café"

```bash
# HTTP Request
curl -X POST "https://your-domain.com/api/integrations/expenses" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 15.00,
    "description": "Café",
    "source": "iphone",
    "category": "Food & Dining"
  }'
```

### 2. Voice + Merchant Detection

**Voice Command:** "Hey Siri, pagué 25 euros en Starbucks"

```bash
curl -X POST "https://your-domain.com/api/integrations/expenses" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.00,
    "description": "Café Starbucks",
    "source": "iphone",
    "merchant": "Starbucks",
    "category": "Food & Dining",
    "payment_method": "tarjeta_credito"
  }'
```

### 3. Receipt Photo Processing

**Flow:** Take photo → OCR → Extract data → Send to API

```bash
curl -X POST "https://your-domain.com/api/integrations/expenses" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 42.35,
    "description": "Compra supermercado",
    "source": "iphone",
    "merchant": "Mercadona",
    "category": "Shopping",
    "date": "2024-01-15",
    "tags": ["grocery", "receipt"],
    "notes": "Compra semanal - receipt photo processed"
  }'
```

## 📧 Email Integration Patterns

### 1. Bank Transaction Notification

**Email Subject:** "Compra realizada por 85,50€ - BBVA"

```bash
curl -X POST "https://your-domain.com/api/integrations/expenses" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 85.50,
    "description": "Compra con tarjeta",
    "source": "email",
    "merchant": "Supermercado El Corte Inglés",
    "category": "Shopping",
    "payment_method": "tarjeta_credito",
    "confidence_score": 0.95,
             "source_metadata": {
           "email_subject": "Compra realizada por 85,50€ - BBVA",
           "bank": "BBVA",
           "card_last_digits": "1234",
           "transaction_id": "TXN789456123"
         }
  }'
```

### 2. PayPal Transaction

**Email Subject:** "Has enviado 30,00 EUR a Spotify"

```bash
curl -X POST "https://your-domain.com/api/integrations/expenses" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 30.00,
    "description": "Spotify Premium",
    "source": "email",
    "merchant": "Spotify",
    "category": "Entertainment",
    "payment_method": "paypal",
    "confidence_score": 0.98,
             "source_metadata": {
           "email_subject": "Has enviado 30,00 EUR a Spotify",
           "paypal_transaction_id": "PP123456789",
           "recipient": "Spotify"
         }
  }'
```

### 3. Bizum Transfer

**Email Subject:** "Has realizado un Bizum de 20€"

```bash
curl -X POST "https://your-domain.com/api/integrations/expenses" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 20.00,
    "description": "Bizum - Cena con amigos",
    "source": "email",
    "payment_method": "bizum",
    "category": "Food & Dining",
    "confidence_score": 0.87,
             "source_metadata": {
           "email_subject": "Has realizado un Bizum de 20€",
           "bizum_reference": "BZ987654321",
           "recipient_phone": "***123"
         }
  }'
```

## 🔄 Response Examples

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 15.0,
    "description": "Café",
    "category": "Food & Dining",
    "source": "iphone",
    "needs_review": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Expense created successfully from iphone"
}
```

### Error Response

```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "minimum": 0.01,
      "type": "number",
      "message": "Amount must be greater than 0",
      "path": ["amount"]
    }
  ]
}
```

## 🚀 Getting Started

1. **Get your JWT token** from the Financy app: Settings → API Keys (`/configuracion/api`)
2. **Test the API** using the built-in test button or `/api/integrations/test`
3. **Create iPhone shortcuts** using the examples above
4. **Set up email parsing** with your preferred email service

### 📱 Easy Token Access

- Navigate to **Settings → API Keys** in your Financy app
- Copy your JWT token with one click
- Test your API connection directly in the app
- Get step-by-step iPhone shortcut instructions

## 📊 Smart Features

- **Auto-categorization:** Categories detected by merchant/description
- **Confidence scoring:** AI-parsed data includes confidence levels
- **Needs review flag:** Low-confidence expenses marked for review
- **Raw data storage:** Original data preserved for debugging
- **Duplicate prevention:** Built-in validation (future feature)
