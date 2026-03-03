# Security Features

This document outlines the security features available in the admin panel.

## Overview

The admin panel now includes comprehensive security features including:
- **Password Change** - Update your account password
- **Two-Factor Authentication (2FA)** - Add an extra layer of security

## Getting Started

### Create Admin User

Before using the security features, you need to create an admin user in the database:

```bash
npm run create-admin
```

Follow the prompts to enter:
- Email address
- Full name
- Password (minimum 8 characters)

The script will hash your password securely and store it in the database.

### Authentication Flow

1. Login with your email and password at `/login`
2. Access the admin panel at `/admin`
3. Navigate to Settings to configure security options

## Password Management

### Change Password

1. Go to **Admin Panel > Settings**
2. Under **Security > Change Password**
3. Enter your current password
4. Enter your new password (minimum 8 characters)
5. Confirm your new password
6. Click **Change Password**

**Password Requirements:**
- Minimum 8 characters
- Passwords are hashed using bcrypt with 12 rounds

## Two-Factor Authentication (2FA)

### Enable 2FA

1. Go to **Admin Panel > Settings**
2. Under **Security > Two-Factor Authentication**
3. Click **Enable 2FA**
4. Install an authenticator app on your phone:
   - Google Authenticator
   - Microsoft Authenticator
   - Authy
   - 1Password
   - Any TOTP-compatible app
5. Scan the QR code with your authenticator app
6. Enter the 6-digit code from your app
7. Click **Verify & Enable**

### Using 2FA

Once enabled, you'll need to enter:
1. Your email and password
2. The 6-digit code from your authenticator app

The code changes every 30 seconds for maximum security.

### Disable 2FA

1. Go to **Admin Panel > Settings**
2. Under **Security > Two-Factor Authentication**
3. Click **Disable 2FA**
4. Enter your password to confirm
5. Click **Disable 2FA**

**Warning:** Disabling 2FA makes your account less secure. Only disable if absolutely necessary.

## Security Best Practices

### Password Guidelines

- Use a unique password (not used on other sites)
- Mix uppercase, lowercase, numbers, and symbols
- Avoid common words or patterns
- Change your password regularly
- Never share your password

### 2FA Guidelines

- Keep backup codes in a secure location
- Don't share your authenticator device
- Use a password manager for the secret key backup
- Enable 2FA immediately after creating your account

## API Endpoints

### Password Change
```
POST /api/auth/change-password
Body: { currentPassword, newPassword }
```

### 2FA Setup
```
POST /api/auth/2fa/setup
Returns: { secret, qrCode }
```

### 2FA Verify
```
POST /api/auth/2fa/verify
Body: { token }
```

### 2FA Disable
```
POST /api/auth/2fa/disable
Body: { password }
```

### 2FA Status
```
GET /api/auth/2fa/status
Returns: { twoFactorEnabled }
```

## Technical Details

### Password Hashing
- Algorithm: bcrypt
- Rounds: 12
- Salt: Automatically generated per password

### 2FA Implementation
- Protocol: TOTP (Time-based One-Time Password)
- Algorithm: SHA1
- Period: 30 seconds
- Digits: 6
- Window: 2 steps (tolerance for clock skew)

### Libraries Used
- `bcryptjs` - Password hashing
- `speakeasy` - TOTP generation and verification
- `qrcode` - QR code generation for easy setup

## Troubleshooting

### "Invalid verification code" error
- Ensure your device time is synced correctly
- Try the next code (wait 30 seconds)
- Check if you're using the correct account in your authenticator

### "Current password is incorrect"
- Double-check your password
- Ensure Caps Lock is off
- Try resetting your password if forgotten

### Lost authenticator device
- Contact system administrator
- Backup codes can be used (if implemented)
- Admin can disable 2FA for your account

## Security Considerations

- All passwords are hashed and never stored in plain text
- 2FA secrets are encrypted in the database
- Session tokens expire after inactivity
- HTTPS is required for production deployments
- Rate limiting should be implemented for login attempts

## Future Enhancements

Possible future security features:
- Backup codes for 2FA
- SMS-based 2FA as alternative
- Password strength meter
- Password history (prevent reuse)
- Account activity logs
- IP whitelisting
- Session management
- Email notifications for security changes
