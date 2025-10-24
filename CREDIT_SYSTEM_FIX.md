# Credit System Fix - Testing Guide

## Issue Fixed
The credit system wasn't properly checking for unlimited credits when generating websites. Users with the secret key would still be blocked if their credit count was < 1.

## Changes Made

### 1. Backend - generateSite Controller
**File**: `backend/controllers/generateSite.ts`
- Updated credit check to account for `hasUnlimitedCredits` flag
- Now allows generation if user has unlimited credits OR has credits remaining
- Added detailed logging for debugging

### 2. Backend - Credits Service
**File**: `backend/services/credits.ts`
- Added logging to track credit operations
- Properly returns `hasUnlimitedCredits` flag in API responses

### 3. Backend - Validation
**File**: `backend/middleware/validation.ts` & `backend/routes/index.ts`
- Added validation schema for secret key endpoint
- Applied validation middleware to `/api/set-secret-key` route

### 4. Frontend - CreditsDisplay
**File**: `frontend/src/components/CreditsDisplay.tsx`
- Added console logging to debug API responses
- Interface properly typed to include `hasUnlimitedCredits`

## How to Test

### Test 1: Regular User Credits
1. Open the app in browser (http://localhost:5173)
2. Log in with a test account
3. Open browser console (F12)
4. Look for `[CreditsDisplay] Received credits:` log
5. You should see: `{ credits: 10, plan: 'free', subscriptionStatus: 'none', hasUnlimitedCredits: false }`

### Test 2: Secret Key Activation
1. In the sidebar, click "Have a secret key? Click here"
2. Enter `gjergj` in the input field
3. Click "Apply"
4. Check browser console - you should see credits update to unlimited
5. The UI should show ∞ symbol instead of number
6. You should see "Unlimited Access Activated" badge

### Test 3: Website Generation with Unlimited Credits
1. After activating secret key (Test 2)
2. Try to generate a website
3. Check backend logs (terminal running npm run dev)
4. You should see: `[generateSite] User <uuid> has unlimited credits`
5. Website should generate successfully
6. Your credit count should remain at ∞ (no deduction)

### Test 4: Website Generation Without Credits
1. Create a new test user OR manually set credits to 0 in database
2. Try to generate a website
3. You should get error: "Insufficient credits to generate website"
4. Backend log should show: `[generateSite] User <uuid> has insufficient credits`

## Debugging

### Check Backend Logs
Look for these log patterns:
- `[Credits] User <uuid>: credits=X, secretKey=Y, unlimited=Z`
- `[generateSite] User <uuid> has unlimited/X credits`
- `User <uuid> has unlimited credits (secret key: gjergj), skipping credit consumption`

### Check Frontend Console
- `[CreditsDisplay] Received credits:` - Shows API response
- Network tab - Check `/api/user-credits` response
- Network tab - Check `/api/set-secret-key` request/response

### Common Issues

**Issue**: Credits not updating after secret key
- **Fix**: Check browser console for API errors
- **Fix**: Verify backend logs show secret key was set
- **Fix**: Manually refresh by reloading the page

**Issue**: Still blocked from generating despite unlimited credits
- **Fix**: Check that `hasUnlimitedCredits` is `true` in API response
- **Fix**: Verify backend updated to latest code (restart dev server)

**Issue**: Secret key not working
- **Fix**: Verify you're using exactly `gjergj` (case-sensitive)
- **Fix**: Check backend logs for "Invalid secret key" messages

## Database Check

To manually verify in Supabase:

```sql
-- Check user credits table
SELECT user_id, credits, secret_key, has_unlimited_credits, plan
FROM user_credits
WHERE user_id = '<your-user-uuid>';

-- Manually grant unlimited credits
UPDATE user_credits 
SET secret_key = 'gjergj', 
    has_unlimited_credits = true
WHERE user_id = '<your-user-uuid>';
```

## Success Criteria
✅ Users can enter secret key "gjergj"
✅ Secret key unlocks unlimited credits
✅ UI shows ∞ symbol for unlimited users
✅ Website generation works with unlimited credits
✅ Credits are not consumed for unlimited users
✅ Regular users still tracked properly in database
