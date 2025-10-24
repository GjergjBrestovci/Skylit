# Secret Key Feature for Unlimited Credits

## Overview
The secret key feature allows authorized users to unlock unlimited website generation credits by entering a special key.

## How It Works

### Database Schema
- Added `secret_key` and `has_unlimited_credits` columns to `user_credits` table
- Users with the secret key "gjergj" get unlimited credits automatically

### Backend Implementation
1. **Credit Tracking**: All credits are now properly tracked in the database using the `user_credits` table
2. **Secret Key Validation**: When a user enters "gjergj" as their secret key, they get unlimited credits
3. **Credit Consumption**: The system skips credit deduction for users with `hasUnlimitedCredits = true`

### API Endpoints

#### Set Secret Key
```
POST /api/set-secret-key
Authorization: Bearer <token>
Body: { "secretKey": "gjergj" }

Response:
{
  "success": true,
  "message": "Secret key validated and unlimited credits activated",
  "credits": 999999,
  "hasUnlimitedCredits": true
}
```

### Frontend UI
- Secret key input appears in the CreditsDisplay component
- Users can click "Have a secret key? Click here" to reveal the input
- Once validated, users see an "Unlimited Access Activated" badge
- The credit display shows ∞ symbol for unlimited users

## Database Migration

Run this migration to add the secret key feature:

```sql
-- Apply migration
psql -d your_database -f supabase/migrations/002_add_secret_key.sql
```

Or in Supabase:
1. Go to SQL Editor
2. Run the contents of `supabase/migrations/002_add_secret_key.sql`

## Usage

### For Regular Users
1. Log in to the platform
2. View your credits in the sidebar
3. If you have a secret key, click "Have a secret key? Click here"
4. Enter your secret key and click "Apply"
5. If valid, you'll get unlimited credits

### For Admins
To grant a user unlimited access:
1. They need to enter the secret key "gjergj" in the UI
2. Or you can directly update the database:

```sql
UPDATE user_credits 
SET secret_key = 'gjergj', 
    has_unlimited_credits = true 
WHERE user_id = '<user_uuid>';
```

## Security Notes
- The secret key is stored in the database but never exposed via API responses
- Only the user themselves can set their secret key via the authenticated endpoint
- The key "gjergj" is hardcoded in the backend validation logic
- Consider using environment variables for production secret keys

## Testing

### Test Unlimited Credits
1. Create a new account
2. Note your initial credits (should be 10)
3. Click "Have a secret key?" and enter "gjergj"
4. Your credits should show ∞
5. Generate a website - no credits should be consumed
6. Check the backend logs to confirm credit consumption was skipped

## Future Enhancements
- Support multiple secret keys with different privilege levels
- Admin dashboard to manage secret keys
- Time-limited secret keys
- Usage analytics for unlimited users
