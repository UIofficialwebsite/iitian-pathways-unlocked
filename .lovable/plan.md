

# Fix Cashfree Phone Number Format for International Numbers

## Problem

The edge function currently strips ALL non-digit characters including the `+` sign:

```typescript
customer_phone: customerPhone?.replace(/[^0-9]/g, '').slice(-15) || "",
```

This produces `13333333333` from `+13333333333`, which Cashfree rejects because:
- **Indian numbers**: Can be `9090407368` or `+919090407368`
- **International numbers**: MUST include `+` prefix like `+16014635923`

## Solution

Update the phone formatting logic to handle both cases properly:

1. For Indian numbers (+91): Strip to just 10 digits OR keep +91 prefix
2. For international numbers: Keep the `+` prefix, remove only spaces/dashes

## File to Modify

### `supabase/functions/create-cashfree-order/index.ts`

**Line 96** - Update the customer_phone formatting:

```typescript
// Before
customer_phone: customerPhone?.replace(/[^0-9]/g, '').slice(-15) || "",

// After - Preserve + for international, allow stripping for India
customer_phone: (() => {
  if (!customerPhone) return "";
  
  // Remove spaces, dashes, parentheses - but keep + and digits
  const cleaned = customerPhone.replace(/[\s\-\(\)]/g, '');
  
  // For Indian numbers (+91), Cashfree accepts just 10 digits
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return cleaned.slice(3); // Return just the 10 digits
  }
  
  // For all other international numbers, keep the + prefix
  // Ensure only + and digits remain
  return cleaned.replace(/[^0-9+]/g, '');
})(),
```

## How It Works

| Input | Output | Valid for Cashfree? |
|-------|--------|---------------------|
| `+919876543210` | `9876543210` | ✅ Indian format |
| `+13333333333` | `+13333333333` | ✅ International format |
| `+447911123456` | `+447911123456` | ✅ UK format |
| `+931234567890` | `+931234567890` | ✅ Afghanistan format |

## Summary

This single change in the edge function ensures:
1. Indian numbers are converted to 10-digit format (Cashfree accepts this)
2. All other international numbers keep their `+` prefix (required by Cashfree)

