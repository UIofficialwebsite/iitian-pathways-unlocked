
# Free Course Enrollment Enhancement

## Overview
Modify the free enrollment flow (courses with price = 0) to:
1. Collect mobile number using the existing phone dialog (same as paid courses)
2. Insert enrollment data into the `payments` table for tracking

## Files to Modify

### 1. `src/components/EnrollButton.tsx`

**Current behavior (lines 397-401):**
```typescript
// Direct Bypass for Free Courses (Price 0)
if (coursePrice === 0) {
  await handleFreeEnroll();
  return;
}
```

**Changes needed:**

a) **Remove the bypass** at lines 397-401 - free courses should follow the same phone check flow as paid courses

b) **Update `handleFreeEnroll` function** (lines 432-480) to:
   - Accept phone number as parameter
   - Insert data into both `enrollments` AND `payments` tables
   - Collect course details (batch name, subjects) for the payments record

**Updated logic flow:**
```
handleEnrollClick() 
  → Check if phone exists in profile
  → If no phone → show phone dialog
  → handlePhoneSubmit() or processPayment()
     → If coursePrice === 0 → handleFreeEnroll(phone)
     → Else → processPayment(phone) [existing Cashfree flow]
```

### 2. `src/components/courses/CourseCard.tsx`

**Current behavior (lines 192-203):**
```typescript
// Logic 2: Free Batch (No Add-ons) -> Direct Enroll
if (isBaseFree) {
    return (
        <button onClick={handleFreeEnroll} ...>
            ENROLL NOW
        </button>
    );
}
```

**Change needed:**
- Replace the direct `handleFreeEnroll` button with `EnrollButton` component
- Pass `coursePrice={0}` so EnrollButton handles the free enrollment flow

```typescript
if (isBaseFree) {
    return (
        <EnrollButton
            courseId={course.id}
            coursePrice={0}
            className={btnClass}
        >
            ENROLL NOW
        </EnrollButton>
    );
}
```

This removes the duplicate `handleFreeEnroll` function from CourseCard entirely.

### 3. `src/pages/BatchConfiguration.tsx`

**Current behavior (lines 352-356):**
```typescript
// BYPASS FOR FREE ENROLLMENT
if (finalTotal === 0) {
    await handleFreeEnroll();
    return;
}
```

**Changes needed:**

a) **Remove the bypass** - free enrollment should go through phone check

b) **Update `handleFreeEnroll` function** (lines 277-334) to:
   - Accept phone number as parameter
   - Insert data into `payments` table along with `enrollments`
   - Collect proper course/addon details for tracking

c) **Modify `handlePayment` function** to:
   - Always check for phone first (remove the free bypass)
   - Call `handleFreeEnroll(phone)` when `finalTotal === 0`
   - Call `processPayment(phone)` when `finalTotal > 0`

### 4. `supabase/functions/create-cashfree-order/index.ts`
No changes needed - this function is only called for paid courses.

## Technical Details

### Payments Table Insert for Free Enrollments

When inserting into `payments` for free enrollments:

```typescript
const paymentData = {
  order_id: `free_${Date.now()}_${userId}`,
  payment_id: 'free_enrollment',
  user_id: userId,
  amount: 0,
  net_amount: 0,
  status: 'success',
  payment_mode: 'free',
  customer_email: userEmail,
  customer_phone: phoneNumber,
  batch: courseName,
  courses: subjectsString, // comma-separated subject names
  discount_applied: false,
  payment_time: new Date().toISOString()
};
```

### Flow Summary

```text
┌─────────────────────────────────────────────────────────┐
│                  Free Course Enrollment                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User clicks "Enroll Now" on free course             │
│                      ↓                                  │
│  2. Check if phone exists in user profile               │
│                      ↓                                  │
│  ┌──────────┬────────────────────┐                      │
│  │ No Phone │  Phone Exists      │                      │
│  └────┬─────┴────────┬───────────┘                      │
│       ↓              ↓                                  │
│  Show phone     Continue with                           │
│  dialog         existing phone                          │
│       ↓              ↓                                  │
│  User submits   ──────┘                                 │
│  phone number                                           │
│       ↓                                                 │
│  3. Save phone to profile                               │
│                      ↓                                  │
│  4. Insert into `enrollments` table                     │
│                      ↓                                  │
│  5. Insert into `payments` table                        │
│                      ↓                                  │
│  6. Show success toast & redirect                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## What Stays Unchanged

- **Paid course flow** - continues to use Cashfree payment gateway
- **Phone dialog UI** - same dialog/drawer component is reused
- **Phone validation logic** - country-specific length validation remains
- **Profile phone storage** - dial_code and phone saved separately

## Summary Table

| File | Change | Purpose |
|------|--------|---------|
| `EnrollButton.tsx` | Remove free bypass, update `handleFreeEnroll` | Collect phone + insert payments |
| `CourseCard.tsx` | Use EnrollButton for free courses | Delegate to centralized logic |
| `BatchConfiguration.tsx` | Remove free bypass, update `handleFreeEnroll` | Collect phone + insert payments |
