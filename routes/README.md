# Routes — Security Contributions

This directory contains all Express.js route handlers. The following security improvements were made to each file:

---

## index.js — Authentication Routes
**Original vulnerabilities:**
- No input validation on registration or login
- No password strength requirements
- No duplicate username check
- req.logout() called without callback (Passport 0.7)

**Security fixes applied:**
- Username validation — minimum 3 characters, alphanumeric only
- Password strength regex — min 8 chars, uppercase, lowercase, number, special character
- Duplicate username check with friendly error message
- Login input validation — empty fields rejected
- Failed login flash message — "Invalid username or password"
- req.logout() updated with callback for Passport 0.7 compatibility

---

## campgrounds.js — Campground CRUD Routes
**Original vulnerabilities:**
- No input validation — any data accepted
- No MongoDB ObjectId validation in URL parameters
- Mongoose callbacks incompatible with Mongoose 9.x
- findByIdAndRemove removed in Mongoose 9

**Security fixes applied:**
- express-validator rules: name (3-100 chars), price (positive numeric), image (valid URL), description (10-1000 chars)
- MongoDB ObjectId validation via middleware.validateId
- Converted all callbacks to async/await
- Replaced findByIdAndRemove with findByIdAndDelete

---

## comments.js — Comment CRUD Routes
**Original vulnerabilities:**
- No input validation — empty comments accepted
- Typo in flash message (successs)
- Mongoose callbacks incompatible with Mongoose 9.x
- findByIdAndRemove removed in Mongoose 9

**Security fixes applied:**
- express-validator rules: comment text required, 1-500 characters
- Validation applied to both POST (create) and PUT (update) routes
- Fixed flash message typo
- Converted all callbacks to async/await
- Replaced findByIdAndRemove with findByIdAndDelete

---

## admin.js — Admin Routes (New File)
**Original:** Did not exist — no admin functionality in original application.

**Contributions:**
- New file created entirely as part of this project
- Admin dashboard route showing total users, campgrounds and comments
- Admin user delete route
- All routes protected by isAdmin middleware