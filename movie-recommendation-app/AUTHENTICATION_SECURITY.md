# Authentication & Security

## Password Encryption

**Important**: Passwords are automatically encrypted and hashed by Supabase. You do NOT need to manually encrypt passwords.

### How It Works

1. **Automatic Encryption**: When a user signs up using `supabase.auth.signUp()`, Supabase automatically:
   - Hashes the password using bcrypt (industry-standard hashing algorithm)
   - Stores only the hashed version in the database
   - Never stores plain text passwords

2. **Password Verification**: When a user signs in:
   - The entered password is hashed using the same algorithm
   - The hash is compared with the stored hash
   - If they match, authentication succeeds

3. **Security Features**:
   - Passwords are hashed with bcrypt (one-way encryption)
   - Salt is automatically added to prevent rainbow table attacks
   - Password strength requirements can be configured in Supabase
   - Rate limiting prevents brute force attacks

## User Account Creation

### Sign Up Process

1. User enters email and password
2. Password is validated (minimum 6 characters by default)
3. Supabase creates the user account:
   - Email is stored
   - Password is hashed and stored
   - User record is created in `auth.users` table
4. If email confirmation is **disabled**:
   - User is automatically logged in
   - Session is created immediately
   - User can use the app right away
5. If email confirmation is **enabled**:
   - Confirmation email is sent
   - User must click the link in the email
   - After confirmation, user can sign in

### Where User Data is Stored

- **Supabase Database**: User accounts are stored in Supabase's `auth.users` table
- **Password Storage**: Only hashed passwords are stored (never plain text)
- **Session Storage**: Sessions are stored securely in browser (localStorage/cookies)

## Security Best Practices

### ✅ Implemented

- ✅ Passwords are automatically hashed (bcrypt)
- ✅ HTTPS required for production
- ✅ Session tokens are secure
- ✅ Password minimum length enforced (6 characters)
- ✅ Email validation
- ✅ Protected routes require authentication
- ✅ Automatic session refresh
- ✅ Secure logout clears all session data

### 🔒 Additional Recommendations

1. **Enable Email Confirmation** (Optional but Recommended):
   - Go to Supabase Dashboard → Authentication → Settings
   - Enable "Enable email confirmations"
   - This ensures users verify their email addresses

2. **Password Strength Requirements**:
   - Configure in Supabase Dashboard → Authentication → Settings
   - Set minimum password requirements
   - Consider requiring uppercase, lowercase, numbers, and special characters

3. **Rate Limiting**:
   - Supabase automatically rate limits authentication attempts
   - Prevents brute force attacks
   - Configurable in Supabase Dashboard

4. **Two-Factor Authentication (2FA)**:
   - Can be enabled in Supabase for additional security
   - Requires user's phone number

5. **Environment Variables**:
   - Never commit `.env.local` to version control
   - Use secure environment variables in production
   - Rotate API keys regularly

## User Credentials Storage

### What Gets Stored

- ✅ Email address (plain text - needed for login)
- ✅ Hashed password (bcrypt hash - cannot be reversed)
- ✅ User ID (UUID)
- ✅ Created timestamp
- ✅ Last sign-in timestamp
- ✅ Email confirmation status

### What Does NOT Get Stored

- ❌ Plain text passwords
- ❌ Password hints
- ❌ Security questions/answers
- ❌ Credit card information
- ❌ Personal identification numbers

## Authentication Flow

### Sign Up Flow

```
User enters email/password
    ↓
Password validated (min 6 chars)
    ↓
Supabase hashes password (bcrypt)
    ↓
User record created in database
    ↓
If email confirmation disabled:
    → User auto-logged in
    → Session created
    → Redirect to app
If email confirmation enabled:
    → Confirmation email sent
    → User must verify email
    → Then can sign in
```

### Sign In Flow

```
User enters email/password
    ↓
Password hashed and compared
    ↓
If match:
    → Session created
    → User logged in
    → Redirect to app
If no match:
    → Error shown
    → User stays on login page
```

## Troubleshooting

### "Password too weak" Error

- Ensure password is at least 6 characters
- Check Supabase password requirements in Dashboard
- Consider adding uppercase, lowercase, numbers

### "Email already registered" Error

- User already has an account
- Use "Login" instead of "Create new account"
- Or use password reset if forgotten

### User Created But Can't Sign In

- Check if email confirmation is required
- User must click confirmation link in email
- Check spam/junk folder
- Resend confirmation email from Supabase Dashboard

## Compliance

- ✅ GDPR compliant (Supabase handles data protection)
- ✅ Passwords encrypted at rest
- ✅ Secure transmission (HTTPS)
- ✅ No plain text password storage
- ✅ Industry-standard hashing (bcrypt)

## Questions?

For more information about Supabase authentication security:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
