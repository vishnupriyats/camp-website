# Middleware — Security Contributions

This directory contains all custom security middleware functions used across the application.

---

## index.js

### Original Vulnerabilities
- All middleware used callback-based Mongoose queries (removed in Mongoose 9)
- No admin role check existed — all users had identical privileges
- No MongoDB ObjectId validation — invalid IDs caused app crashes

### Security Contributions

#### checkCampgroundOwnership
**Original:** Only verified if the requesting user owned the campground.
**Fix:** Updated to allow admin users to bypass ownership check — admins can edit or delete any campground.

#### checkCommentOwnership
**Original:** Only verified if the requesting user owned the comment.
**Fix:** Updated to allow admin users to bypass ownership check — admins can edit or delete any comment.

#### isLoggedIn
**Original:** Basic authentication check existed but used deprecated callback syntax.
**Fix:** Converted to modern syntax compatible with Passport 0.7.

#### isAdmin (New)
**Original:** Did not exist — no admin role differentiation.
**Contribution:** New middleware function added entirely as part of this project. Checks both that the user is authenticated and that their role is set to admin. Protects all /admin routes from regular user access.

#### validateId (New)
**Original:** Did not exist — invalid MongoDB ObjectIds caused unhandled crashes.
**Contribution:** New middleware function added entirely as part of this project. Validates that URL parameters are valid MongoDB ObjectIds before any database query is executed. Returns a friendly error message and redirects if the ID is invalid.