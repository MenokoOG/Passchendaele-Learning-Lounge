# Security Recommendations

This document outlines security considerations and recommendations for the API.

## Current Security Findings

### Rate Limiting (High Priority)

**Issue**: API routes lack rate limiting, making them vulnerable to abuse through excessive requests.

**Affected Routes**:
- All authenticated routes (notes, kanban, calendar, files, etc.)
- Public routes (auth/login, auth/register)

**Recommendation**: Implement rate limiting using `express-rate-limit` package:

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Stricter limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

**Priority**: High - Should be implemented before production deployment

---

## Implemented Security Features

### Authentication & Authorization

✅ **JWT-based authentication**: Secure token-based auth with configurable expiration

✅ **Password hashing**: Bcrypt with salt rounds of 10 for all passwords

✅ **Role-based access control**: Admin, instructor, and student roles with proper checks

✅ **Ownership verification**: Resources protected with ownership checks before modification

### Input Validation

✅ **Required field validation**: Routes validate required fields and return 400 errors

✅ **Email normalization**: Email addresses converted to lowercase for consistency

### Error Handling

✅ **Consistent error responses**: Standardized error format across all routes

✅ **No sensitive data in errors**: Password hashes and sensitive fields excluded from responses

---

## Additional Recommendations

### 1. Input Sanitization (Medium Priority)

**Recommendation**: Add input sanitization to prevent XSS and injection attacks:

```bash
npm install express-validator
```

Example usage:
```typescript
import { body, validationResult } from 'express-validator';

router.post('/notes',
  requireAuth,
  body('title').trim().escape(),
  body('content').trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... rest of handler
  }
);
```

### 2. CORS Configuration (Medium Priority)

**Current**: CORS is enabled for all origins

**Recommendation**: Restrict CORS to specific domains in production:

```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

### 3. Security Headers (Medium Priority)

**Recommendation**: Add security headers using helmet:

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

### 4. Request Size Limits (Low Priority)

**Current**: JSON body limit is 20mb

**Status**: ✅ Already implemented appropriately for file uploads

### 5. MongoDB Injection Prevention (Low Priority)

**Current**: Using Mongoose which provides some protection

**Recommendation**: Add explicit sanitization for query parameters:

```bash
npm install express-mongo-sanitize
```

```typescript
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize());
```

### 6. Environment Variables (Critical)

**Recommendation**: Ensure these variables are properly set in production:

- `JWT_SECRET`: At least 32 characters, randomly generated
- `MONGO_URI`: Use connection string with authentication
- `NODE_ENV=production`: For production deployments

**Example .env.production**:
```
NODE_ENV=production
JWT_SECRET=your-super-secret-key-min-32-chars-random
JWT_EXPIRES=7d
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true
PORT=4000
ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
```

### 7. Password Requirements (Low Priority)

**Current**: No password complexity requirements

**Recommendation**: Add password validation:

```typescript
function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordRegex.test(password);
}
```

---

## Testing Security

### Security Testing Checklist

- [ ] Test authentication bypass attempts
- [ ] Test authorization bypass for different roles
- [ ] Test SQL/NoSQL injection in all inputs
- [ ] Test XSS vulnerabilities in text inputs
- [ ] Test CSRF protection
- [ ] Test rate limiting thresholds
- [ ] Test file upload restrictions
- [ ] Test session management

### Recommended Tools

- **OWASP ZAP**: Automated security testing
- **Burp Suite**: Manual security testing
- **npm audit**: Dependency vulnerability checking
- **Snyk**: Continuous security monitoring

---

## Compliance & Best Practices

### OWASP Top 10 Coverage

1. ✅ **Injection**: Mongoose provides some protection, recommend adding sanitization
2. ✅ **Broken Authentication**: JWT with proper hashing implemented
3. ✅ **Sensitive Data Exposure**: Passwords excluded from responses
4. ⚠️ **XML External Entities**: Not applicable (no XML processing)
5. ✅ **Broken Access Control**: Role-based and ownership checks implemented
6. ⚠️ **Security Misconfiguration**: Needs helmet and CORS restrictions
7. ⚠️ **Cross-Site Scripting (XSS)**: Needs input sanitization
8. ⚠️ **Insecure Deserialization**: Not applicable
9. ⚠️ **Using Components with Known Vulnerabilities**: Run `npm audit` regularly
10. ⚠️ **Insufficient Logging & Monitoring**: Basic logging present, needs enhancement

### Regular Maintenance

- Run `npm audit` weekly
- Update dependencies monthly
- Review security logs regularly
- Conduct security reviews quarterly

---

## Implementation Priority

1. **Critical (Implement immediately)**:
   - Rate limiting on authentication routes
   - Proper environment variables in production

2. **High (Before production)**:
   - Rate limiting on all routes
   - Helmet security headers
   - CORS restrictions

3. **Medium (Soon after launch)**:
   - Input sanitization
   - MongoDB injection prevention
   - Password complexity requirements

4. **Low (Ongoing)**:
   - Enhanced logging
   - Security monitoring
   - Regular audits
