

# International Phone Number with Dial Code Selector Implementation

## Overview

This plan implements a proper country dial code selector in the "Contact Details Required" modal shown during enrollment, stores the dial code separately in the `profiles.dial_code` column, and updates the Cashfree payment integration to accept international phone numbers without fake fallback values.

## Current Issues

1. **EnrollButton Component** - Shows a simple text input asking for "Phone Number (with Country Code)" but no dropdown
2. **Cashfree Edge Function** - Has hardcoded fallback `"9999999999"` for missing phones (Indian format only)
3. **Build Errors** - Two TypeScript errors in `EnrollmentReceiptView.tsx` that must be fixed first

## Files to Modify

| File | Purpose |
|------|---------|
| `src/components/dashboard/EnrollmentReceiptView.tsx` | Fix 2 TypeScript build errors |
| `src/components/EnrollButton.tsx` | Add country dial code dropdown |
| `supabase/functions/create-cashfree-order/index.ts` | Remove fake fallback, accept real international numbers |

---

## Part 1: Fix Build Errors

### EnrollmentReceiptView.tsx

**Line 157** - TypeScript type inference issue with ternary:
```typescript
// Current (causes error)
type: isAddon ? 'Add-on' : 'Batch'

// Fix - Add type assertion
type: (isAddon ? 'Add-on' : 'Batch') as 'Add-on' | 'Batch'
```

**Line 204** - Invalid property `couponCode`:
```typescript
// Current (causes error)
items: finalItems,
couponCode: null

// Fix - Remove the invalid property
items: finalItems
```

---

## Part 2: Update EnrollButton with Country Dial Code Selector

### New UI Design

```text
+------------------------------------------+
|                   ×                       |
|           ● ● ●                          |
|                                          |
|  Contact Details Required                 |
|                                          |
|  Please provide your phone number...     |
|                                          |
|  PHONE NUMBER                            |
|  +------------------+  +----------------+|
|  | +91 India     ▼ |  | 9876543210     ||
|  +------------------+  +----------------+|
|  (Select country)      (10 digits for   |
|                         India)           |
|                                          |
|         [    CONTINUE TO ENROLL   ]      |
|                                          |
|             [  CANCEL  ]                 |
+------------------------------------------+
```

### Changes Required

**1. Add new state variables:**
```typescript
const [countryCodes, setCountryCodes] = useState<Array<{
  dial_code: string;
  name: string;
  phone_length: number;
}>>([]);
const [selectedDialCode, setSelectedDialCode] = useState("+91");
const [expectedPhoneLength, setExpectedPhoneLength] = useState(10);
```

**2. Fetch country codes when modal opens:**
```typescript
useEffect(() => {
  if (showPhoneDialog) {
    supabase.from('country_codes')
      .select('dial_code, name, phone_length')
      .order('name')
      .then(({ data }) => {
        setCountryCodes(data || []);
        // Default to India
        const india = data?.find(c => c.dial_code === '91');
        if (india) setExpectedPhoneLength(india.phone_length);
      });
  }
}, [showPhoneDialog]);
```

**3. Update VerificationContentProps interface:**
```typescript
interface VerificationContentProps {
  // ...existing props
  countryCodes: Array<{dial_code: string; name: string; phone_length: number}>;
  selectedDialCode: string;
  setSelectedDialCode: (val: string) => void;
  expectedPhoneLength: number;
}
```

**4. Update VerificationContent JSX:**
Replace the single input with split layout:
```typescript
<div className="form-group">
  <label className="form-label">Phone Number</label>
  <div className="phone-input-wrapper">
    <select 
      className="dial-code-select"
      value={selectedDialCode}
      onChange={(e) => {
        setSelectedDialCode(e.target.value);
        const country = countryCodes.find(c => `+${c.dial_code}` === e.target.value);
        if (country) setExpectedPhoneLength(country.phone_length);
      }}
    >
      {countryCodes.map((c) => (
        <option key={c.dial_code} value={`+${c.dial_code}`}>
          +{c.dial_code} {c.name}
        </option>
      ))}
    </select>
    <input 
      type="tel" 
      className="form-input phone-number-input"
      placeholder={`e.g., ${'9'.repeat(expectedPhoneLength)}`}
      value={manualPhone}
      onChange={(e) => {
        // Only allow digits
        const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
        setManualPhone(digitsOnly);
      }}
    />
  </div>
</div>
```

**5. Add CSS for split phone input:**
```css
.phone-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.dial-code-select {
  width: 160px;
  padding: 14px 10px;
  font-size: 14px;
  border: 1px solid #000000;
  background: white;
  cursor: pointer;
}

.phone-number-input {
  flex: 1;
  min-width: 0;
}
```

**6. Update validation logic:**
```typescript
const handlePhoneSubmit = async () => {
  setInlineError(null);
  
  const digitsOnly = manualPhone.replace(/[^0-9]/g, '');
  const country = countryCodes.find(c => `+${c.dial_code}` === selectedDialCode);
  
  if (country && digitsOnly.length !== country.phone_length) {
    setInlineError(`Phone number should be ${country.phone_length} digits for ${country.name}`);
    return;
  }
  
  // ... rest of logic
};
```

**7. Save dial_code and phone separately to profiles:**
```typescript
await supabase.from('profiles').update({
  dial_code: selectedDialCode,  // e.g., "+91"
  phone: manualPhone            // e.g., "9876543210"
}).eq('id', user.id);
```

**8. Send full number to processPayment:**
```typescript
const fullPhoneNumber = `${selectedDialCode}${manualPhone}`;
await processPayment(fullPhoneNumber);
```

**9. Update profile check on load:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('phone, dial_code')
  .eq('id', user.id)
  .single();

// Check if both dial_code and phone exist
if (profile?.dial_code && profile?.phone && profile.phone.length >= 5) {
  processPayment(`${profile.dial_code}${profile.phone}`);
} else {
  setShowPhoneDialog(true);
}
```

---

## Part 3: Update Cashfree Edge Function

### Remove Hardcoded Indian Fallback

**Current code (line 96):**
```typescript
customer_phone: customerPhone || "9999999999",
```

**Updated code:**
```typescript
// Clean the phone number - strip everything except digits
// Cashfree accepts international numbers as digits only
customer_phone: customerPhone?.replace(/[^0-9]/g, '').slice(-15) || "",
```

**Important:** Cashfree Payment Gateway accepts international phone numbers. The `customer_phone` field in their API is flexible - it should just contain digits (no + sign or spaces). The format we send: just the digits from the full number (e.g., "919876543210" for Indian, "14155551234" for USA).

### Cashfree Phone Format Notes

According to Cashfree documentation:
- `customer_phone` field accepts 10-15 digit numbers
- International numbers work fine when formatted as digits only
- The payment gateway itself does not restrict based on phone country

---

## Summary of Changes

```text
+---------------------------------------------------+
|  EnrollmentReceiptView.tsx                        |
+---------------------------------------------------+
|  - Line 157: Add type assertion for 'type'        |
|  - Line 204: Remove invalid 'couponCode' property |
+---------------------------------------------------+

+---------------------------------------------------+
|  EnrollButton.tsx                                 |
+---------------------------------------------------+
|  - Add countryCodes state                         |
|  - Add selectedDialCode state (+91 default)       |
|  - Add expectedPhoneLength state (10 default)     |
|  - Fetch country_codes on modal open              |
|  - Split UI: dial code dropdown + phone input     |
|  - Dynamic validation per country phone_length    |
|  - Save dial_code and phone separately            |
|  - Send combined number for payment               |
|  - Add CSS for phone input wrapper                |
+---------------------------------------------------+

+---------------------------------------------------+
|  create-cashfree-order/index.ts                   |
+---------------------------------------------------+
|  - Remove "9999999999" hardcoded fallback         |
|  - Strip non-digits from customerPhone            |
|  - Accept international format                    |
+---------------------------------------------------+
```

## About Cashfree & International Payments

**Question: Can non-Indian users pay?**

Answer: **Yes, but with limitations:**
1. Cashfree Payment Gateway **does accept international cards**
2. However, Cashfree is primarily an Indian payment gateway
3. For international users:
   - Credit/Debit cards work
   - UPI will NOT work (India-only)
   - Some international methods may not be available

The phone number field is NOT a payment restriction - it's just for contact/receipt purposes. Users can pay with any valid international card regardless of their phone number's country.

