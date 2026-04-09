var Campground = require("../models/campground");
var Comment    = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = async function(req, res, next) {
    if(req.isAuthenticated()) {
        try {
            var foundCampground = await Campground.findById(req.params.id);
            if(!foundCampground) {
                req.flash("error", "Campground not found");
                return res.redirect("back");
            }
            if(foundCampground.author.id.equals(req.user._id)|| req.user.role === "admin") {
                next();
            } else {
                req.flash("error", "You don't have permission");
                res.redirect("back");
            }
        } catch(err) {
            req.flash("error", "Campground not found");
            res.redirect("back");
        }
    } else {
        req.flash("error", "You need to be logged in");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = async function(req, res, next) {
    if(req.isAuthenticated()) {
        try {
            var foundComment = await Comment.findById(req.params.comment_id);
            if(!foundComment) {
                req.flash("error", "Comment not found");
                return res.redirect("back");
            }
            if(foundComment.author.id.equals(req.user._id) || req.user.role === "admin") {
                next();
            } else {
                req.flash("error", "You don't have permission");
                res.redirect("back");
            }
        } catch(err) {
            req.flash("error", "Comment not found");
            res.redirect("back");
        }
    } else {
        req.flash("error", "You need to be logged in");
        res.redirect("/login");
    }
}

middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in");
    res.redirect("/login");
}

middlewareObj.isAdmin = function(req, res, next) {
    if(req.isAuthenticated() && req.user.role === "admin") {
        return next();
    }
    req.flash("error", "You need to be an admin to do that");
    res.redirect("back");
}

module.exports = middlewareObj;