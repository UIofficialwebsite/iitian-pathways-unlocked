
# Remove Unnecessary Google Auth Warning Toast

## Problem Identified

In `src/components/auth/GoogleAuth.tsx` (lines 51-76), there's a `useEffect` that shows a toast notification **every time** the Google login component loads:

```typescript
useEffect(() => {
  if (!originWarningShown) {
    // Console warning (fine for developers)
    console.warn(...);
    
    // THIS IS THE PROBLEM - shows toast to ALL users
    toast({
      title: "⚠️ Google Auth Setup Required",
      description: `Add "${currentOrigin}" to Authorized JavaScript Origins...`,
      duration: 10000,
    });
    
    setOriginWarningShown(true);
  }
}, [originWarningShown, toast]);
```

This was intended as a developer reminder but is showing to all users, which is confusing since login is working fine.

## Solution

Remove the toast notification entirely from the `useEffect`. The console warning can stay (only visible in browser developer tools), but the user-facing toast should be removed.

## Changes to Make

**File: `src/components/auth/GoogleAuth.tsx`**

1. Remove the `toast` call from the `useEffect` on lines 68-72
2. Keep the `console.warn` for developer debugging (optional)
3. Can also remove the `originWarningShown` state and the entire useEffect since it's no longer needed

### Before (lines 51-76):
```typescript
const [originWarningShown, setOriginWarningShown] = useState(false);

useEffect(() => {
  if (!originWarningShown) {
    const currentOrigin = window.location.origin;
    console.warn(...);
    
    toast({
      title: "⚠️ Google Auth Setup Required",
      description: `Add "${currentOrigin}" to Authorized JavaScript Origins...`,
      duration: 10000,
    });
    
    setOriginWarningShown(true);
  }
}, [originWarningShown, toast]);
```

### After:
- Remove the entire `useEffect` block (lines 52-76)
- Remove the `originWarningShown` state (line 47)
- This will stop the toast from appearing to users

## Summary

| Change | File |
|--------|------|
| Remove warning toast useEffect | `src/components/auth/GoogleAuth.tsx` |
| Remove `originWarningShown` state | `src/components/auth/GoogleAuth.tsx` |

This is a simple fix - just removing the developer debugging code that was accidentally left in for production users.
