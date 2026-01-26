
# Fix ProfileEditModal to Display Correct Dial Code

## Problem Identified

The database correctly shows:
- **dial_code**: `+61` (Australia)
- **phone**: (empty or just digits)

But the `ProfileEditModal` ignores the `dial_code` column and defaults to `+91` because it tries to parse an old combined phone format.

## Root Cause

Lines 41-55 in `ProfileEditModal.tsx`:
```typescript
const rawPhone = profile.phone || "";
if(rawPhone.startsWith("+91")) {
   setCountryCode("+91");           // Always defaults here
   setLocalPhone(rawPhone.replace("+91", "").trim());
} else if (rawPhone.length > 0) {
   setCountryCode("+91");           // Or here
   setLocalPhone(rawPhone);
}
```

The code never checks `profile.dial_code` which now stores the dial code separately.

## Solution

Update `ProfileEditModal.tsx` to:

1. **Read `dial_code` from profile directly** - use `profile.dial_code` instead of parsing
2. **Fetch country codes** - add dropdown with all countries like other components
3. **Save both fields separately** - update both `dial_code` and `phone` columns
4. **Add validation** - enforce phone length based on selected country

## Files to Modify

### `src/components/dashboard/ProfileEditModal.tsx`

**1. Add new state variables (after line 27):**
```typescript
const [countryCodes, setCountryCodes] = useState<Array<{
  dial_code: string;
  name: string;
  phone_length: number;
}>>([]);
const [expectedPhoneLength, setExpectedPhoneLength] = useState(10);
```

**2. Add useEffect to fetch country codes (after line 60):**
```typescript
useEffect(() => {
  if (isOpen && countryCodes.length === 0) {
    supabase
      .from('country_codes')
      .select('dial_code, name, phone_length')
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) {
          setCountryCodes(data);
        }
      });
  }
}, [isOpen, countryCodes.length]);
```

**3. Update the profile loading logic (lines 41-55) to:**
```typescript
// Use dial_code if available, otherwise try to parse from phone
if (profile.dial_code) {
  setCountryCode(profile.dial_code);
  setLocalPhone(profile.phone || "");
  // Set expected length based on dial code
  const dialDigits = profile.dial_code.replace('+', '');
  supabase.from('country_codes')
    .select('phone_length')
    .eq('dial_code', dialDigits)
    .single()
    .then(({ data }) => {
      if (data) setExpectedPhoneLength(data.phone_length);
    });
} else {
  // Fallback for old data
  const rawPhone = profile.phone || "";
  if (rawPhone.includes(" ")) {
    const parts = rawPhone.split(" ");
    setCountryCode(parts[0] || "+91");
    setLocalPhone(parts.slice(1).join(""));
  } else {
    setCountryCode("+91");
    setLocalPhone(rawPhone);
  }
}
```

**4. Update handleMainSave (lines 80-102) to save dial_code separately:**
```typescript
const { error } = await supabase
  .from('profiles')
  .update({
    student_name: fullName,
    gender: gender,
    dial_code: countryCode,  // Save dial_code separately
    phone: localPhone,       // Save only the digits
  })
  .eq('id', profile.id);
```

**5. Replace the phone input section (lines 162-196) with a proper dropdown:**
```typescript
<div className="space-y-1">
  <label className="text-[11px] font-semibold text-[#555] uppercase tracking-wide">Mobile Number</label>
  <div className={`flex items-center gap-2 ${isPhoneEditable ? '' : ''}`}>
    <select
      value={countryCode}
      onChange={(e) => {
        setCountryCode(e.target.value);
        const dialDigits = e.target.value.replace('+', '');
        const country = countryCodes.find(c => c.dial_code === dialDigits);
        if (country) setExpectedPhoneLength(country.phone_length);
      }}
      disabled={!isPhoneEditable}
      className={`h-9 px-2 border border-[#d1d5db] rounded-md text-[13px] bg-white ${!isPhoneEditable ? 'text-[#888] cursor-not-allowed bg-[#f9fafb]' : 'text-[#333]'}`}
    >
      {countryCodes.length === 0 ? (
        <option value={countryCode}>{countryCode}</option>
      ) : (
        countryCodes.map((c) => (
          <option key={c.dial_code} value={`+${c.dial_code}`}>
            +{c.dial_code} {c.name}
          </option>
        ))
      )}
    </select>
    
    <input 
      ref={phoneInputRef}
      type="tel"
      value={localPhone}
      onChange={(e) => {
        const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, expectedPhoneLength);
        setLocalPhone(digitsOnly);
      }}
      className={`flex-1 h-9 px-3 border border-[#d1d5db] rounded-md text-[13px] ${!isPhoneEditable ? 'text-[#666] cursor-not-allowed bg-[#f9fafb]' : 'text-[#333]'}`}
      placeholder={`${'9'.repeat(expectedPhoneLength)}`}
      disabled={!isPhoneEditable}
      maxLength={expectedPhoneLength}
    />
    
    <button 
      type="button" 
      onClick={handlePhoneBtnClick}
      className="text-[11px] font-medium text-[#2563eb] hover:underline whitespace-nowrap px-1 cursor-pointer"
    >
      {isPhoneEditable ? "Done" : "Edit"}
    </button>
  </div>
  {isPhoneEditable && (
    <p className="text-[11px] text-gray-500">Enter {expectedPhoneLength} digits for selected country</p>
  )}
</div>
```

## Summary

| Change | Location |
|--------|----------|
| Add countryCodes state | Line 27-30 |
| Fetch country codes on open | After line 60 |
| Read profile.dial_code first | Lines 41-55 |
| Save dial_code separately | Lines 84-90 |
| Dropdown for country selection | Lines 162-196 |

## Expected Result

The Edit Details modal will:
1. Show the correct dial code (+61 Australia) from the database
2. Allow users to select from a dropdown of all countries
3. Enforce the correct phone length for each country
4. Save dial_code and phone as separate fields
