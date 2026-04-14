
require("dotenv").config();
var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    flash          = require("connect-flash"),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    methodOverride = require("method-override"),
    Campground     = require("./models/campground"),
    Comment        = require("./models/comment"),
    User           = require("./models/user"),
    seedDB         = require("./seeds");

var helmet = require("helmet");
var cors = require("cors");
var mongoSanitize = require("express-mongo-sanitize");
//var xssClean = require("xss-clean");
var rateLimit = require("express-rate-limit");
var morgan = require("morgan");

//https implementation
var fs = require("fs");
var https = require("https");
//requiring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");
	adminRoutes      = require("./routes/admin");


mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended: true}));

//hide the tech stack from hackers
app.disable("x-powered-by");

// security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "https://stackpath.bootstrapcdn.com", "https://maxcdn.bootstrapcdn.com", "'unsafe-inline'"],
            scriptSrc: ["'self'", "https://code.jquery.com", "https://cdnjs.cloudflare.com", "https://maxcdn.bootstrapcdn.com", "'unsafe-inline'", "'unsafe-hashes'"],
            imgSrc: ["'self'", "https:", "data:"],
            fontSrc: ["'self'", "https://maxcdn.bootstrapcdn.com"],
            connectSrc: ["'self'", "https://stackpath.bootstrapcdn.com", "https://maxcdn.bootstrapcdn.com", "https://cdnjs.cloudflare.com", "https://code.jquery.com"],
            scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// prevent NoSQL injection
app.use(mongoSanitize({
    replaceWith: '_'
}));

// prevent XSS attacks
//app.use(xssClean());

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// session must come before passport and methodOverride
// Added the cookie configuration to set httpOnly and expiration time

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

app.use(methodOverride("_method"));
// logging
app.use(morgan("dev"));
app.use(flash());

// passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// rate limiting
var loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: "Too many login attempts, please try again after 15 minutes"
});

app.post("/login", loginLimiter);

// routes
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/admin", adminRoutes);

// 404 handler
app.use(function(req, res, next) {
    res.status(404).render("error", {
        code: 404,
        message: "Page not found"
    });
});

// global error handler
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(err.status || 500).render("error", {
        code: err.status || 500,
        message: "Something went wrong. Please try again later."
    });
});

//http to https redirection
var sslOptions = {
    key: fs.readFileSync("certificates/key.pem"),
    cert: fs.readFileSync("certificates/cert.pem")
};


app.use(function(req, res, next) {
    if(!req.secure) {
        return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
});

https.createServer(sslOptions, app).listen(3443, function() {
    console.log("HTTPS server listening on port 3443");
});

app.listen(process.env.PORT || 3000, process.env.IP, function() {
    console.log("HTTP server listening on port 3000");
});
