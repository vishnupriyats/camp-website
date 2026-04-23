# Models — Security Contributions

This directory contains all Mongoose schema definitions for the application.

---

## user.js

### Original Vulnerabilities
- No role field — all users had identical privileges
- passport-local-mongoose import incompatible with latest version
- No role-based access control possible

### Security Contributions

#### Role Field (New)
**Original:** User schema only had username and password fields.
**Contribution:** Added role field with enum validation restricting values to "user" or "admin". Default value is "user" ensuring all existing and new users are regular users unless explicitly promoted. Admin accounts can only be assigned via direct database access — preventing self-promotion through the application interface.

#### Password Hashing (Existing — Documented)
**Original:** passport-local-mongoose handled password hashing but this was not documented.
**Clarification:** Passwords are automatically hashed using pbkdf2 algorithm with a randomly generated per-user salt, 25,000 iterations and 512-byte key length. Plain text passwords are never stored in the database.

#### Import Fix
**Original:** passport-local-mongoose import failed with latest version due to ESM/CJS compatibility issue.
**Fix:** Added .default fallback — passportLocalMongoose.default || passportLocalMongoose.

---

## campground.js

### Original
Basic schema with name, image, price, description and author fields. No security changes required to the schema itself — security is enforced at the route and middleware level.

---

## comment.js

### Original
Basic schema with text and author fields. No security changes required to the schema itself — security is enforced at the route and middleware level.