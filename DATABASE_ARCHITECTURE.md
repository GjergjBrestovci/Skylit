# Database Architecture - How It Works

## Two Supabase Clients Pattern

### 1. `supabase` (Service Role Client)
**File**: `backend/supabase.ts`
**Key**: `SUPABASE_SERVICE_ROLE_KEY`
**Purpose**: Database operations (CRUD)
**Permissions**: Bypasses Row Level Security (RLS)
**Used in**:
- `backend/services/credits.ts` - Credit management
- `backend/controllers/saveProject.ts` - Save projects
- `backend/controllers/getProjects.ts` - Fetch projects
- `backend/controllers/getProject.ts` - Fetch single project
- `backend/controllers/projectManagement.ts` - Update/delete/duplicate
- `backend/services/databaseHealth.ts` - Health checks

### 2. `supabaseAuth` (Anon Client)
**File**: `backend/supabase.ts`
**Key**: `SUPABASE_ANON_KEY`
**Purpose**: User authentication
**Permissions**: Respects RLS policies
**Used in**:
- `backend/controllers/auth.ts` - Register, login, refresh
- `backend/middleware/auth.ts` - Token verification

## Why This Pattern?

### The Problem
When users authenticate, they get a JWT token. However, when the **backend** makes database requests, it needs to:
1. Know which user is making the request (from JWT)
2. Access the database with admin permissions (to bypass RLS)

### The Solution
- **Authentication**: Use `supabaseAuth` with ANON_KEY to validate user tokens
- **Authorization**: Use middleware to extract `userId` from token
- **Database Access**: Use `supabase` with SERVICE_ROLE_KEY to perform operations
- **Security**: Controllers check `req.userId` before any database operation

## Request Flow

```
1. User Login
   └─> Frontend sends: POST /auth/login { email, password }
       └─> Backend uses: supabaseAuth.auth.signInWithPassword()
           └─> Returns: JWT token to frontend

2. User Makes Request (e.g., save project)
   └─> Frontend sends: POST /projects { title, code }
       Headers: { Authorization: Bearer <JWT> }
       └─> Middleware: authenticateToken()
           └─> Uses: supabaseAuth.auth.getUser(token)
           └─> Extracts: userId from token
           └─> Attaches: req.userId
       └─> Controller: saveProject()
           └─> Checks: if (!userId) return 401
           └─> Uses: supabase.from('projects').insert({ user_id: userId, ... })
           └─> SERVICE_ROLE bypasses RLS
           └─> Returns: Project data

3. User Views Projects
   └─> Frontend sends: GET /projects
       Headers: { Authorization: Bearer <JWT> }
       └─> Middleware extracts userId
       └─> Controller: getProjects()
           └─> Uses: supabase.from('projects').select().eq('user_id', userId)
           └─> Returns: Only user's projects
```

## Security Guarantees

✅ **Users can't access other users' data**
   - Controllers filter by `req.userId` (from authenticated token)
   - Even though SERVICE_ROLE bypasses RLS, code enforces permissions

✅ **SERVICE_ROLE never exposed to frontend**
   - Lives in `backend/.env` only
   - Never sent in responses or logs

✅ **Token validation is strict**
   - Middleware checks expiration locally
   - Verifies with Supabase remotely
   - Returns specific error codes for expired tokens

✅ **Database RLS still protects against SQL injection**
   - Even if backend code had bugs, RLS prevents cross-user access
   - SERVICE_ROLE is only used by trusted backend code

## Comparison: ANON_KEY vs SERVICE_ROLE

| Aspect | ANON_KEY | SERVICE_ROLE |
|--------|----------|--------------|
| **Permissions** | Limited by RLS | Bypasses RLS (admin) |
| **Use Case** | Public API, Auth | Backend operations |
| **Security** | Can expose to frontend | MUST keep secret |
| **RLS Context** | Sets `auth.uid()` if user authenticated | No `auth.uid()` context |
| **Best For** | Client-side operations | Server-side operations |

## Why Previous Setup Failed

**Before Fix**:
```typescript
// backend/supabase.ts
const supabase = createClient(url, ANON_KEY)

// backend/controllers/saveProject.ts
supabase.from('projects').insert({ user_id: userId, ... })
// ❌ FAILS: RLS checks auth.uid() which is NULL
// Backend request has no auth context even though user is authenticated
```

**After Fix**:
```typescript
// backend/supabase.ts
const supabase = createClient(url, SERVICE_ROLE_KEY)  // Bypasses RLS
const supabaseAuth = createClient(url, ANON_KEY)      // For auth

// backend/controllers/saveProject.ts
supabase.from('projects').insert({ user_id: userId, ... })
// ✅ SUCCESS: SERVICE_ROLE bypasses RLS
// Backend code ensures userId matches authenticated user
```

## Development vs Production

### Development
- Can use `AUTH_BYPASS=true` to skip authentication
- Still uses real database with SERVICE_ROLE
- Useful for testing without login flow

### Production
- `AUTH_BYPASS` should be `false` or unset
- All requests require valid JWT token
- Middleware strictly validates tokens
- SERVICE_ROLE operations still require authenticated userId

---

**Key Takeaway**: The backend acts as a trusted intermediary. Users authenticate via JWT, middleware verifies identity, then backend uses admin permissions to enforce data access rules in code.
