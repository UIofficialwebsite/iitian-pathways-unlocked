

# Fix: Free Course Re-Enrollment Error

## Problem
When clicking "Enroll Now" on a free batch the **second time** (after already being enrolled), the system throws a Cashfree "order_amount_invalid" error instead of showing "Already Enrolled" message.

## Root Cause
In `handleEnrollClick()`, when a user's profile already has a phone number saved, it directly calls `processPayment()` without checking if the course is free:

```typescript
// Lines 414-415 - Current buggy code:
if (profile?.dial_code && profile?.phone && profile.phone.length >= 5) {
  processPayment(`${profile.dial_code}${profile.phone}`);  // Always calls processPayment!
}
```

The `handleFreeEnroll()` function already has proper duplicate handling (shows "Already Enrolled" toast for error code 23505), but it's never called when the user has an existing phone number.

## Solution
Add a check for `coursePrice === 0` before deciding which function to call.

## File to Modify

### `src/components/EnrollButton.tsx` (lines 414-415)

**Before:**
```typescript
if (profile?.dial_code && profile?.phone && profile.phone.length >= 5) {
  processPayment(`${profile.dial_code}${profile.phone}`);
}
```

**After:**
```typescript
if (profile?.dial_code && profile?.phone && profile.phone.length >= 5) {
  const fullPhoneNumber = `${profile.dial_code}${profile.phone}`;
  if (coursePrice === 0) {
    await handleFreeEnroll(fullPhoneNumber);
  } else {
    processPayment(fullPhoneNumber);
  }
}
```

## What This Fixes
- Free course enrollments with existing phone → calls `handleFreeEnroll()` → shows "Already Enrolled" toast if duplicate
- Paid course enrollments → unchanged, still calls `processPayment()` → goes to Cashfree

## What Stays Unchanged
- Paid course flow (Cashfree payment gateway)
- Phone dialog UI and validation
- `handleFreeEnroll()` function logic (already has duplicate detection)
- All other enrollment logic

