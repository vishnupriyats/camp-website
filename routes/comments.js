/* var express    = require("express");
var router     = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment    = require("../models/comment");
var middleware = require("../middleware");




//new route
router.get("/new",middleware.isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err || !campground ){
			req.flash("error","Campground not found");
			res.redirect("back");
		}
		else{
			res.render("comments/new",{campground: campground});
		}
	});
	
});


//create route
router.post("/",middleware.isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err){console.log(err);}
		else{
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					req.flash("error","Something went wrong")
					console.log(err)}
				else{
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
req.flash("successs","Successfully added a comment");					res.redirect("/campgrounds/"+campground._id);
					
				}
			})
		}
	})
})

//edit route - edit form

router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
//error handling - if id changed in url
	Campground.findById(req.params.id,function(err,foundCampground){
	 if(err || !foundCampground){
		 req.flash("error","Campground not found")
		return res.redirect("back");
	 }

//edit route
		Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){res.redirect("back")}
		else{
			res.render("comments/edit",{campground_id: req.params.id, comment: foundComment});
		}
	}); 
	
 });
	
});

//update route for updating to db

router.put("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updated)
		{
		
		if(err){
			res.redirect("back");}
		else{
			res.redirect("/campgrounds/"+req.params.id);
		}
		
	});
});

//destroy route

router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err)
		{
		if(err){res.redirect("/campgrounds/"+req.params.id);}
		else{
			req.flash("success","Successfully deleted the comment")
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});



module.exports = router; */

var express    = require("express");
var router     = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment    = require("../models/comment");
var middleware = require("../middleware");
const { body, validationResult } = require("express-validator");

// Validation middleware for campground input
var commentValidation = [
    body("comment[text]").trim()
    .notEmpty().withMessage("Comment text cannot be empty")
    .isLength({min: 1,max: 500}).withMessage("Comment must be between 1 and 500 characters")
];

//new route
router.get("/new", middleware.isLoggedIn, async function(req, res) {
    try {
        var campground = await Campground.findById(req.params.id);
        if(!campground) {
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        res.render("comments/new", {campground: campground});
    } catch(err) {
        req.flash("error", "Campground not found");
        res.redirect("back");
    }
});

//create route
router.post("/", middleware.isLoggedIn, commentValidation,async function(req, res) {
    try {
        var errors = validationResult(req);
        if(!errors.isEmpty()) {
            var errorMessages = errors.array().map(e => e.msg);
            req.flash("error", errorMessages.join(", "));
            return res.redirect("back");
        }
        var campground = await Campground.findById(req.params.id);
        if(!campground) {
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        var comment = await Comment.create(req.body.comment);
        comment.author.id = req.user._id;
        comment.author.username = req.user.username;
        await comment.save();
        campground.comments.push(comment);
        await campground.save();
        req.flash("success", "Successfully added a comment");
        res.redirect("/campgrounds/" + campground._id);
    } catch(err) {
        req.flash("error", "Something went wrong");
        res.redirect("back");
    }
});

//edit route - edit form
router.get("/:comment_id/edit", middleware.checkCommentOwnership, async function(req, res) {
    try {
        var foundCampground = await Campground.findById(req.params.id);
        if(!foundCampground) {
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        var foundComment = await Comment.findById(req.params.comment_id);
        if(!foundComment) {
            req.flash("error", "Comment not found");
            return res.redirect("back");
        }
        res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
    } catch(err) {
        res.redirect("back");
    }
});

//update route
router.put("/:comment_id", middleware.checkCommentOwnership, commentValidation, async function(req, res) {
    console.log("comment update body:", req.body);
    console.log("validation errors:", validationResult(req).array());
    try {
        var errors = validationResult(req);
        if(!errors.isEmpty()) {
            errors.array().forEach(function(error) {
                req.flash("error", error.msg);
            });
            return res.redirect("back");
        }
        await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
        res.redirect("/campgrounds/" + req.params.id);
    } catch(err) {
        res.redirect("back");
    }
});

//destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, async function(req, res) {
    console.log("DELETE route hit", req.params.id);
    try {
        var deleted = await Comment.findByIdAndDelete(req.params.comment_id);
        console.log("Deleted:", deleted);
        req.flash("success", "Successfully deleted the comment");
        res.redirect("/campgrounds/" + req.params.id);
    } catch(err) {
        console.log("Error deleting comment:", err);
        res.redirect("/campgrounds/" + req.params.id);
    }
});

module.exports = router;