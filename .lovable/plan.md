
# Fix `is_live` Course Visibility and Enrollment Control

## Problem Summary

The build errors indicate that the `Course` type in `src/components/admin/courses/types.ts` is missing the `is_live` property, which is already present in the Supabase `courses` table. This causes TypeScript errors when filtering by `is_live` in multiple files.

Additionally, we need to:
1. Hide non-live courses from all public course listings
2. Prevent enrollment in non-live courses via the EnrollmentCard
3. Keep enrollment history visible regardless of course live status

## Build Errors to Fix

```
src/components/BackendIntegratedWrapper.tsx(269,20): error TS2339: Property 'is_live' does not exist on type 'Course'.
src/components/EnrollButton.tsx(444,11): error TS2769: No overload matches this call.
src/pages/CourseListing.tsx(83,57): error TS2339: Property 'is_live' does not exist on type 'Course'.
src/pages/Courses.tsx(60,47): error TS2339: Property 'is_live' does not exist on type 'Course'.
```

## Files to Modify

### 1. `src/components/admin/courses/types.ts`
Add the missing `is_live` property to the Course interface.

**Change:**
```typescript
export interface Course {
  // ... existing fields ...
  parent_course_id?: string | null;
  is_live?: boolean | null;  // ADD THIS LINE
}
```

### 2. `src/components/EnrollButton.tsx` (Line ~444)
Fix the TypeScript error on the `insert` call. The error suggests the object structure is incorrect. Looking at line 444, the `subject_name` field should be a string or null, not an array.

**Change (around line 449):**
```typescript
// Before:
subject_name: selectedSubjects.length > 0 ? selectedSubjects : null

// After:
subject_name: selectedSubjects.length > 0 ? selectedSubjects[0] : null
```

### 3. `src/components/iitm/PaidCoursesTab.tsx`
Filter out non-live courses before any other filtering.

**Change (around line 28):**
```typescript
// Before:
const iitmCourses = courses.filter(course => 
  course.exam_category === 'IITM BS' || course.exam_category === 'IITM_BS'
);

// After:
const iitmCourses = courses.filter(course => 
  course.is_live === true && 
  (course.exam_category === 'IITM BS' || course.exam_category === 'IITM_BS')
);
```

### 4. `src/pages/IITMBSPrep.tsx`
Filter out non-live courses.

**Change (around line 155-157):**
```typescript
// Before:
const iitmCourses = useMemo(() => 
  courses.filter(c => c.exam_category === 'IITM BS' || c.exam_category === 'IITM_BS')
, [courses]);

// After:
const iitmCourses = useMemo(() => 
  courses.filter(c => 
    c.is_live === true && 
    (c.exam_category === 'IITM BS' || c.exam_category === 'IITM_BS')
  )
, [courses]);
```

### 5. `src/hooks/useRealtimeContentManagement.tsx`
Add `is_live` filter to the `filterCoursesByProfile` function.

**Change (around line 361):**
```typescript
// Before:
const filterCoursesByProfile = (courses: Course[]) => {
  return courses.filter(course => {
    if (profile.program_type === 'IITM_BS') {
      // ...
    }
  });
};

// After:
const filterCoursesByProfile = (courses: Course[]) => {
  return courses.filter(course => {
    // First check if course is live
    if (course.is_live !== true) return false;
    
    if (profile.program_type === 'IITM_BS') {
      // ... rest of logic
    }
  });
};
```

### 6. `src/components/courses/detail/EnrollmentCard.tsx`
Add logic to prevent enrollment for non-live courses. Display a message when course is not live.

**Changes:**

a) Add `isLive` prop to the component interface (line ~22):
```typescript
export interface EnrollmentCardProps {
  course: Course;
  // ... existing props ...
  isLive?: boolean;  // ADD THIS
}
```

b) Update the component to accept the prop (line ~28):
```typescript
const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ 
  course, 
  // ... existing props ...
  isLive = true  // Default to true for backward compatibility
}) => {
```

c) Update `renderMainButton` function (around line 118) to check live status:
```typescript
const renderMainButton = () => {
  const btnClasses = "flex-1 text-lg bg-black hover:bg-black/90 text-white h-11 min-w-0 px-4";
  
  // If course is not live, show disabled state
  if (!isLive) {
    return (
      <Button 
        size="lg" 
        className="flex-1 text-lg bg-gray-400 text-white h-11 min-w-0 px-4 cursor-not-allowed"
        disabled
      >
        <span className="truncate">Enrollment Closed</span>
      </Button>
    );
  }
  
  // ... rest of existing logic ...
};
```

### 7. `src/pages/CourseDetail.tsx`
Pass the `isLive` status to the EnrollmentCard component. No need to block viewing the course page (for enrollment history), but disable enrollment.

**Change (where EnrollmentCard is rendered):**
```typescript
<EnrollmentCard 
  course={course}
  // ... existing props ...
  isLive={course.is_live === true}
/>
```

Also pass to MobileEnrollmentBar if it has enrollment action.

### 8. `src/components/dashboard/MyEnrollments.tsx` (NO CHANGE NEEDED)
This component fetches enrollments directly from the `enrollments` table joined with `courses`. It does NOT filter by `is_live` because we want users to still see their enrollment history for courses they previously enrolled in, even if those courses are now marked as not live.

## Summary Table

| File | Change | Purpose |
|------|--------|---------|
| `types.ts` | Add `is_live?: boolean \| null` | Fix TypeScript errors |
| `EnrollButton.tsx` | Fix `subject_name` type | Fix insert error |
| `PaidCoursesTab.tsx` | Add `is_live === true` filter | Hide non-live courses |
| `IITMBSPrep.tsx` | Add `is_live === true` filter | Hide non-live courses |
| `useRealtimeContentManagement.tsx` | Add `is_live` check | Hide non-live courses |
| `EnrollmentCard.tsx` | Add disabled state for non-live | Prevent enrollment |
| `CourseDetail.tsx` | Pass `isLive` prop | Control enrollment UI |

## What Stays Unchanged

- **MyEnrollments.tsx**: Shows all past enrollments regardless of course `is_live` status
- **BackendIntegratedWrapper.tsx**: Already has `is_live` filter (line 269) - just needs type fix
- **Courses.tsx & CourseListing.tsx**: Already have `is_live` filter - just needs type fix
