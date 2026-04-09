var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var User = require("../models/user");
var Campground = require("../models/campground");
var Comment = require("../models/comment");

// Admin dashboard route
router.get("/dashboard", middleware.isAdmin, async function(req, res) {
    try {
        var users = await User.find({});
        var campgrounds = await Campground.find({});
        var comments = await Comment.find({});
        res.render("admin/dashboard", {
            users: users, 
            campgrounds: campgrounds, 
            comments: comments,
            userCount: users.length,
            campgroundCount: campgrounds.length,
            commentCount: comments.length
        });
    } catch(err) {
        req.flash("error", "Something went wrong");
        res.redirect("/campgrounds");
    }
});

// Route to delete a user
router.delete("/users/:id", middleware.isAdmin, async function(req, res) {
    try {
        await User.findByIdAndDelete(req.params.id);
        req.flash("success", "User deleted successfully");
        res.redirect("/admin/dashboard");
    } catch(err) {
        req.flash("error", "Something went wrong");
        res.redirect("/admin/dashboard");
    }
});

module.exports = router;
