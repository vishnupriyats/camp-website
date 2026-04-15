Security Vulnerabilities and Fixes.

This document shows the security flaws that existed in the original codebase and the corrections made.

---

## 1. Session Management

### Vulnerability
```javascript
// BEFORE - hard-coded session secret.
app.use(require("express-session")({
    secret: Believe in you,
    resave: false,
    saveUninitialized: false
}));
```

### Fix
```javascript
// AFTER - Secure cookie session implementation
app.use(require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
}));
```

---

## 2. XSS Vulnerability in Template.

### Vulnerability
```html
<!-- OUTPUT - RAW HTML, can easily lead to XSS attacks -->
<p><%- campground.description %></p>
```

### Fix
```html
<!-- AFTER - Escaped HTML output, XSS prevented -->
<p><%= campground.description %></p>
```

---

## 3. NoSQL Injection

### Vulnerability
```javascript
// BEFORE - No user input sanitization.
// Attacker could submit: { "username": { "$gt": "" } }
app.use(bodyParser.urlencoded({extended: true}));
```

### Fix
```javascript
// AFTER - Sanitize inputs in order to remove MongoDB operators.
app.use(mongoSanitize({
    replaceWith: '_'
}));
```

---

## 4. No Input Validation

### Vulnerability
```javascript
// BEFORE - No validation, accept any data.
router.post("/", middleware.isLoggedIn, asynchronous function (req, res)
    var name  = req.body.name;
    var image = req.body.image;
    var desc  = req.body.description;
    var price = req.body.price;
    await Campground.create({name, image, desc, price});
});
```

### Fix
```javascript
// AFTER - Complete validation rules.
var campgroundValidation = [
    body("campground[name]")
        .trim()
        .notEmpty().withMessage(Name of campground is mandatory)
        .isLength({min: 3, max: 100}).withMessage(Name should be between 3 and 100 characters),
    body("campground[price]")
        .trim()
        .notEmpty().withMessage("Price is required")
        .isNumeric().withMessage(Price should be a number)
        .isFloat({min: 0}).withMessage: Price should be a positive number,
    body("campground[image]")
        .trim()
        .notEmpty().withMessage("Image URL is not specified)
        .isURL().withMessage(Image should be a valid URL),
    body("campground[description]")
        .trim()
        .notEmpty().withMessage("Description is required")
        .isLength({min: 10, max: 1000}).withMessage(description should have 10-1000 characters)
];
```

---

## 5. No Rate Limiting

### Vulnerability
```javascript
// BEFORE - There was no rate limiting, and an unlimited number of logins could be made.
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}));
```

### Fix
```javascript
// AFTER - Rate limiting is set, limit 5 attempts in 15 minutes.
var loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    error: "There were too many attempts to log in, you should re-try within 15 minutes.
});
app.post("/login", loginLimiter);
```

---

## 6. Weak Password Policy

### Vulnerability
```javascript
// BEFORE - No password strength requirements.
// Users were allowed to register using password 123.
router.post("/register" function(req, res) {
    var newUser = new User( username: req.body. username);
    await User.register(newUser, req.body.password);
});
```

### Fix
```javascript
// AFTER - Requirement of strong passwords put in place.
var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
if(!passwordRegex.test(password)) {
    req.flash("error", "Password should be at least 8 letters, and should contain upper and lower case, number and special character);
    return res.redirect("/register");
}
```

---

## 7. No Role-Based Access Control.

### Vulnerability
```javascript
// Before - No role field, users had the same privileges.
mongoose userSchema = new.Schema({
    username: String,
    password: String
});
```

### Fix
```javascript
// AFTER - Enum validation on role field.
var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
});
```

---

## 8. No Security Headers

### Vulnerability
```javascript
// BEFORE - No security headers.
// App could be affected by clickjacking, MIME sniffing, and XSS attacks.
app.use(express.static(__dirname + "/public"));
```

### Fix
```javascript
// AFTER - Helmet.js adds 10 security headers.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ['"self', "https://stackpath.bootstrapcdn.com, "unsafe-inline"
            scriptSrc: ['self', "https://code.jquery.com/', unsafe-inline'],
            imgSrc: ["'self'", "https:", "data:"],
        }
    }
}));
app.disable("x-powered-by");
```

---

## 9. No HTTPS

### Vulnerability
```javascript
// BEFORE - HTTP alone and all data is sent in plaintext.
app.listen(3000, function() {
    console.log(listening to the port 3000);
});
```

### Fix
```javascript
// AFTER - HTTPS using self-signed certificate.
var sslOptions = {
    key: fs.readFileSync("certificates/key.pem"),
    cert: fs.readFileSync("certificates/cert.pem")
};
https.createServer(sslOptions, app).listen(3443, function() {
    console.log(“Listening on port 3443 with HTTPS server);
});
```

---

## 10. No Error Handling

### Vulnerability
```javascript
// BEFORE - No good error handling, stack traces were visible to users.
// Errors caused the application to crash or provided sensitive data.
```

### Fix
```javascript
// AFTER - Global error handler hides sensitive information.
app.use(function(err,req,res,next) {
    console.error(err.stack);
    res.status(err.status || 500).render("error", {
        code: err.status || 500,
        message: Some thing went wrong. Try again later.
    });
});
```
