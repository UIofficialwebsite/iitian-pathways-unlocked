
# Fix Phone Number Max Digit Limit Enforcement

## Problem Identified

Looking at the screenshot, the phone input for Canada (+1) shows "456789999999" which is **12 digits** when it should only allow **10 digits**.

The current implementation has two issues:

1. **`maxLength` set incorrectly**: Set to `expectedPhoneLength + 2` (allowing 12 characters for a 10-digit limit)
2. **`onChange` doesn't enforce limit**: The handler strips non-digits but doesn't cap at the expected length

### Current Code (Both Files)

```typescript
// BatchConfiguration.tsx (line 711-714)
onChange={(e) => {
  const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
  setManualPhone(digitsOnly);  // No length enforcement!
}}
maxLength={expectedPhoneLength + 2}  // Allows extra chars

// EnrollButton.tsx (line 251-254)
const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
  setManualPhone(digitsOnly);  // No length enforcement!
};
```

## Solution

Enforce the exact digit limit in the `onChange` handler by slicing to `expectedPhoneLength`:

```typescript
const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, expectedPhoneLength);
```

Also set `maxLength` to exactly `expectedPhoneLength` (no extra buffer needed).

## Files to Modify

### 1. `src/pages/BatchConfiguration.tsx`

**Line 711-714** - Update the onChange handler:
```typescript
// Before
onChange={(e) => {
  const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
  setManualPhone(digitsOnly);
}}

// After
onChange={(e) => {
  const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, expectedPhoneLength);
  setManualPhone(digitsOnly);
}}
```

**Line 715** - Fix maxLength:
```typescript
// Before
maxLength={expectedPhoneLength + 2}

// After
maxLength={expectedPhoneLength}
```

### 2. `src/components/EnrollButton.tsx`

**Line 251-254** - Update handlePhoneChange:
```typescript
// Before
const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
  setManualPhone(digitsOnly);
  if (inlineError) setInlineError(null);
};

// After
const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, expectedPhoneLength);
  setManualPhone(digitsOnly);
  if (inlineError) setInlineError(null);
};
```

**Line 299** - Fix maxLength:
```typescript
// Before
maxLength={expectedPhoneLength + 2}

// After
maxLength={expectedPhoneLength}
```

## Expected Behavior After Fix

| Country | Dial Code | Max Digits | User Types | Stored |
|---------|-----------|------------|------------|--------|
| India | +91 | 10 | 9876543210123 | 9876543210 |
| Canada | +1 | 10 | 4567899999999 | 4567899999 |
| UK | +44 | 10 | 7911123456789 | 7911123456 |
| Afghanistan | +93 | 9 | 701234567890 | 701234567 |

The input will:
1. Only allow digits (no letters/symbols)
2. Automatically stop at the exact limit for the selected country
3. Show the correct placeholder with the expected number of 9s
