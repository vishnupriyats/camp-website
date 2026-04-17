## Project Overview

YelpCamp is a site where users get to explore, share and review campgrounds. It has been developed as a hardened application with extensive security upgrades to a previously insecure application.

**Original Repository:** https://github.com/vishnupriyats/camp-website

---

## Features

### User Features
- Register and Log in with secure authentication.
- View all campgrounds
- Add, modify and remove personal campgrounds.
- Add, edit and delete campground comments.
- Secure logout

### Admin Features
- Access admin dashboard
- See the number of users, campgrounds, comments.
- Modify or remove any campground.
- Modify or remove any comment.
- Delete any user

---

## Security Improvements

| # | Security Feature | Implementation |
|---|---|---|
| 1 | Https | Self-signed ssl, Http redirects to Https.
| 2 | Session Management| Environment-based secret, httpOnly, sameSite, Expiry: 24hr,
| 3 | Password Hashing | pbkdf2 passport-local-mongoose, user-specific salt |
| 4 | Password Strength | Min 8 chars, uppercase, lowercase, number, special character |
| 5 | Rate Limiting | Max 5 login attempts per 15 minutes per IP |
| 6 | Input Validation | express-validator on any form facing the user |
| 7 | NoSQL Injection | express-mongo-sanitize removes operators: $ and.
| 8 | XSS Prevention | EJS auto-escaping, unsafe <%- usage fixed.
| 9 |  Security Headers | Helmet.js - 10 headers such as CSP, HSTS, X-Frame-Options |
| 10 | CORS | Only trusted origin |
| 11 | Role-Based Access | Admin and user roles with varying privileges|
| 12 | Handling of errors | Global error handler, custom 404 page |
| 13 | logging| Morgan HTTP request logger |
| 14 | ID Validation| MongoDB ObjectId validation in URL parameters |
| 15 | Hide Framework | X-Powered-By header deleted.

For detailed before/after comparisons see [SECURITY.md](SECURITY.md)

---

## Project Structure

camp-website/
├── app.js                  # Main application file
├── .env                    # Environment variables (not committed)
├── .gitignore              # Git ignore file
├── SECURITY.md             # Security vulnerabilities and fixes
├── certificates/           # SSL certificates (not committed)
├── middleware/
│   └── index.js            # Security middleware (isAdmin, validateId, ownership checks)
├── models/
│   ├── campground.js       # Campground schema
│   ├── comment.js          # Comment schema
│   └── user.js             # User schema with role field
├── routes/
│   ├── admin.js            # Admin dashboard routes
│   ├── campgrounds.js      # Campground CRUD routes
│   ├── comments.js         # Comment CRUD routes
│   └── index.js            # Auth routes (register, login, logout)
├── views/
│   ├── admin/
│   │   └── dashboard.ejs   # Admin dashboard
│   ├── campgrounds/        # Campground views
│   ├── comments/           # Comment views
│   ├── partials/           # Header and footer
│   ├── error.ejs           # Custom error page
│   ├── landing.ejs         # Landing page
│   ├── login.ejs           # Login page
│   └── register.ejs        # Register page
└── public/                 # Static assets

## Setup and Installation

### Prerequisites
- Node.js v18+
- MongoDB
- OpenSSL (for HTTPS)

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/vishnupriyats/camp-website.git
cd camp-website
```

**2. Install dependencies**
```bash
npm install
```

**3. Create .env file**
```bash
touch .env
```
To add to the file called .env, put in the following:

**4. Generate SSL certificates**
```bash
mkdir certificates
The following is the command line to create a new key with 1500 days of validity: openssl req -x509 -newkey rsa:4096 -keyout certificates/key.pem -out certificates/cert.pem -days 365 -nodes
```

**5. Start MongoDB**
```bash
service mongodb-community is started.
```

**6. Run the application**
```bash
node app.js
```

**7. Access the application**
- HTTPS: https://localhost:3443
- HTTP: http://localhost:3000 (redirects to HTTPS)

---

## Usage

### Regular User
1. Go to https://localhost:3443
2. Click Signup to create an account.
3. Sign in using your account.
4. Explore campgrounds or make up your own.
5. Add comments to campgrounds

### Admin User
1. Signin with admin user.
2. In navbar, click **Admin Dashboard.
3. User, campground and comment management.

### Making a User Admin
```bash
mongosh
use yelp_camp
db.users.updateOne( {username: yourusername, $set: {role: "admin"}})
```

---

## Testing

SAST Testing Tools were used.
| Tool | Type | Result |
|---|---|---|
| Snyk | Dependency scan | 4 vulnerabilities in request package |
| ESLint plugin + security | Code analysis | 0 issues detected |
| npm audit | Dependency scan | 4 Vulnerabilities found |

### Security Features Tested
| Feature | Test | Result |
|---|---|---|
| Rate limiting| 6 failed logins attempts | Blocked after 5 |
| Input validation | Nothing was typed in the form | Error message displayed |
| XSS prevention | Script tag in description | Escaped not executed |
| NoSQL injection | $gt operator in login | Stripped by sanitizer |
| Invalid ID | /campgrounds/invalidid | Redirected with error |
| Admin access | Regular user accessing /admin | Permission denied |

---

## Security Improvements Summary

Security was not taken into account in the initial application. There were 7 feature branches that were improved as follows:

- **feature/bug-fixes** - Added Mongoose 9.x and Passport 0.7 compatibility.
- **session-management/feature** - Secured session management.
- **feature/authorization** - Added dashboard and admin role.
- **feature/authentication** — Rate limiting and password validation
- **feature/input-validation** - Input sanitization and XSS/NoSQL prevention.
- **feature/security-headers** - CSP, CORS, Helmet.js.
- **feature/error-handling** — Global error logging and error handler.
- **feature/https** - HTTPS using self-signed certificate.