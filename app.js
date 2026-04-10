require("dotenv").config();
var mongoSanitize = require("express-mongo-sanitize");
//var xssClean = require("xss-clean");
var rateLimit = require("express-rate-limit");
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

//requiring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");
	adminRoutes      = require("./routes/admin");

mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended: true}));

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
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
}
}));

app.use(methodOverride("_method"));
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

app.listen(process.env.PORT || 3000, process.env.IP, function() {
    console.log("listening to the port 3000");
});
