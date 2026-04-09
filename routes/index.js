/* var express 	= require("express");
var router 		= express.Router();
var passport 	= require("passport");
var User		= require("../models/user")

//home page

router.get("/",function(req,res){
	res.render("landing")
});


//Auth routes

//regiter new route - form
router.get("/register",function(req,res){
	res.render("register");
});

//register create route

router.post("/register",function(req,res){
        console.log("register hit", req.body);
        var newUser = new User({username: req.body.username});

/* router.post("/register",function(req,res){
	var newUser = new User({username: req.body.username}); */

/*	
	User.register(newUser ,req.body.password,function(err,user){
		if(err){
			req.flash("error",err.message)
			return res.render('register');
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success","Welcome to Yelpcamp " + user.username)
		res.redirect("/campgrounds");
		});
	});
	
}); 


//login form
router.get("/login",function(req,res){
	res.render("login");
})

//login authenticate
router.post("/login",passport.authenticate("local",{
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
}),function(req,res){
	
});

//logout 

router.get("/logout",function(req,res){
	req.logout();
	req.flash("success",'Logged you out!');
	res.redirect("/campgrounds");
});


//middleware

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router; */


var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User     = require("../models/user");

//home page
router.get("/", function(req, res) {
    res.render("landing");
});

//register form
router.get("/register", function(req, res) {
    res.render("register");
});

//register create route
router.post("/register", async function(req, res) {
    try {
        console.log("register hit", req.body);

        // username validation
        var username = req.body.username;
        var usernameRegex = /^[a-zA-Z0-9]{3,}$/;
        if(!usernameRegex.test(username)) {
            req.flash("error", "Username must be at least 3 characters and contain only letters and numbers");
            return res.redirect("/register");
        }

        // check duplicate username
        var existingUser = await User.findOne({username: username});
        if(existingUser) {
            req.flash("error", "Username already exists, please choose a different one");
            return res.redirect("/register");
        }
        
        // password strength validation
        var password = req.body.password;
        var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!passwordRegex.test(password)) {
            req.flash("error", "Password must be at least 8 characters and include uppercase, lowercase, number and special character");
            return res.redirect("/register");
        }

        var newUser = new User({username: req.body.username});
        var registeredUser = await User.register(newUser, req.body.password);
        await new Promise((resolve, reject) => {
            req.login(registeredUser, function(err) {
                if(err) reject(err);
                else resolve();
            });
        });
        req.flash("success", "Welcome to Yelpcamp " + registeredUser.username);
        res.redirect("/campgrounds");
    } catch(err) {
        console.log(err);
        req.flash("error", err.message);
        res.redirect("/register");
    }
});

//login form
router.get("/login", function(req, res) {
    res.render("login");
});

//login authenticate
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true
}));

//logout
router.get("/logout", function(req, res) {
    req.logout(function(err) {
        if(err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }
        req.flash("success", "Logged you out!");
        res.redirect("/campgrounds");
    });
});

module.exports = router;