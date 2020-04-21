var express    = require("express");
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



module.exports = router;