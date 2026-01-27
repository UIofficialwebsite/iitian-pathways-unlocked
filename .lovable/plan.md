
# Visual Enrollment Indicator for Course Cards

## Overview
Add a visual "Enrolled" indicator to course cards that shows when a user is already fully enrolled in a batch (main course + all add-ons). If add-ons remain for purchase, allow normal enrollment flow. Prevent duplicate purchases of fully purchased batches.

## Key Logic
1. **Show "Enrolled" badge**: User owns main course AND all available add-ons (or no add-ons exist)
2. **Allow normal flow**: User owns main course but add-ons are still available for purchase
3. **Allow normal flow**: User doesn't own the course at all
4. **Prevent duplicate purchase**: When fully enrolled, replace buy button with "Let's Study" or "Explore"

## Files to Modify

### 1. `src/components/courses/CourseCard.tsx`
**Purpose**: Add enrollment check and visual indicator

**Changes**:
- Add state for enrollment status (`isMainCourseOwned`, `ownedAddonIds`, `isFullyEnrolled`)
- Add `useAuth` hook to get current user
- Fetch user's enrollments for this course on mount
- Calculate if fully enrolled (main + all addons owned)
- Show "ENROLLED" badge on card when fully enrolled
- Replace "BUY NOW" button with "EXPLORE" or "LET'S STUDY" when fully enrolled
- Keep normal buy flow if add-ons are available for purchase

**Visual Indicator**:
```
┌────────────────────────────────────┐
│  [Course Image]        ✓ ENROLLED  │
│                                    │
│  Course Title                      │
│  ...                               │
│                                    │
│  [EXPLORE]  [LET'S STUDY]          │
└────────────────────────────────────┘
```

### 2. `src/components/dashboard/FreeBatchSection.tsx` (StandardCourseCard)
**Purpose**: Same enrollment indicator for free batch cards

**Changes**:
- Add enrollment check logic similar to CourseCard
- Show "ENROLLED" badge when fully enrolled
- Replace "Enroll" button with "Explore" when fully enrolled
- Allow normal flow if add-ons remain

### 3. `src/components/dashboard/RecommendedBatchCard.tsx`
**Purpose**: Same enrollment indicator for recommended batch cards

**Changes**:
- Add enrollment check logic
- Show "ENROLLED" badge when fully enrolled
- Replace "BUY NOW" with "LET'S STUDY" when fully enrolled

### 4. `src/components/iitm/IITMCourseCard.tsx`
**Purpose**: Same enrollment indicator for IITM course cards

**Changes**:
- Add enrollment check logic
- Show visual indicator for enrolled status
- Update button behavior when fully enrolled

### 5. `src/components/EnrollButton.tsx`
**Purpose**: Block enrollment for already fully enrolled courses

**Changes**:
- Accept new optional prop `isFullyEnrolled`
- If `isFullyEnrolled` is true, show toast "Already enrolled" and navigate to dashboard instead of processing payment

---

## Technical Implementation Details

### Enrollment Check Query
```typescript
const checkEnrollmentStatus = async () => {
  if (!user || !courseId) return;
  
  // Fetch user's enrollments for this course
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('subject_name, status')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .in('status', ['active', 'paid', 'success']);
  
  // Fetch all addons for this course
  const { data: addons } = await supabase
    .from('course_addons')
    .select('id, subject_name')
    .eq('course_id', courseId);
  
  if (enrollments && enrollments.length > 0) {
    // Main course owned = enrollment with null subject_name
    const mainOwned = enrollments.some(e => !e.subject_name);
    
    // Get owned addon names
    const ownedSubjectNames = enrollments
      .filter(e => e.subject_name)
      .map(e => e.subject_name);
    
    // Check if all addons are owned
    const allAddonsOwned = addons 
      ? addons.every(addon => 
          ownedSubjectNames.includes(addon.id) || 
          ownedSubjectNames.includes(addon.subject_name)
        )
      : true; // No addons = considered "all owned"
    
    return {
      isMainCourseOwned: mainOwned,
      isFullyEnrolled: mainOwned && allAddonsOwned,
      hasRemainingAddons: mainOwned && !allAddonsOwned
    };
  }
  
  return {
    isMainCourseOwned: false,
    isFullyEnrolled: false,
    hasRemainingAddons: false
  };
};
```

### Visual Indicator Badge
```tsx
{isFullyEnrolled && (
  <div className="absolute top-3 right-3 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
    <Check className="w-3 h-3" /> ENROLLED
  </div>
)}
```

### Button Rendering Logic
```tsx
const renderBuyButton = () => {
  // Fully enrolled - show "Let's Study"
  if (isFullyEnrolled) {
    return (
      <button
        onClick={() => navigate('/dashboard')}
        className={`${btnClass} bg-green-600 hover:bg-green-700`}
      >
        LET'S STUDY
      </button>
    );
  }
  
  // Main owned but addons available - show "Upgrade"
  if (isMainCourseOwned && hasRemainingAddons) {
    return (
      <button
        onClick={() => navigate(`/courses/${course.id}/configure`)}
        className={btnClass}
      >
        UPGRADE
      </button>
    );
  }
  
  // Normal enrollment flow (existing logic)
  // ...existing code...
};
```

---

## Duplicate Purchase Prevention

The duplicate prevention already exists in multiple places:
1. **BatchConfiguration.tsx**: Redirects if fully enrolled
2. **EnrollButton.tsx**: `handleFreeEnroll` catches unique constraint error (23505)
3. **Database**: Unique constraint on `(user_id, course_id, subject_name)`

We will enhance this by:
1. Checking enrollment status before showing payment dialog
2. Showing "Already enrolled" toast if user clicks enroll on a fully enrolled course
3. Redirecting to dashboard or course explore page

---

## Summary of Changes

| Component | Enrollment Check | Badge | Button Change | Duplicate Block |
|-----------|-----------------|-------|---------------|-----------------|
| CourseCard.tsx | Yes | Yes | Yes | Yes |
| FreeBatchSection.tsx | Yes | Yes | Yes | Yes |
| RecommendedBatchCard.tsx | Yes | Yes | Yes | Yes |
| IITMCourseCard.tsx | Yes | Yes | Yes | Yes |
| EnrollButton.tsx | - | - | - | Enhanced |

## User Experience Flow

1. **Not enrolled**: Normal buy/enroll button visible
2. **Partially enrolled** (main only, addons available): "UPGRADE" button, no badge
3. **Fully enrolled**: Green "ENROLLED" badge + "LET'S STUDY" button
4. **Click on enrolled course**: Navigate to dashboard or show info toast
