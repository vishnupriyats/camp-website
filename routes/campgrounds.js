var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//index route - show all items

router.get("/",function(req,res){
	
	Campground.find({},function(err,campgrounds){
		if(err){console.log(err)}
		else{
			res.render("campgrounds/index",{campgrounds: campgrounds});
			
		}
	});
	
	
});

//create route-add new items

router.post("/",middleware.isLoggedIn,function(req,res){
	var name=req.body.name;
	var image=req.body.image;
	var desc=req.body.description;
	var price=req.body.price;
	var author={
		id:req.user._id,
		username: req.user.username
	}
	var newCamp={ name: name , image: image,description: desc,author: author,price: price}
	Campground.create(newCamp,function(err,campground){
	if(err){console.log(err);}
	else{
		req.flash("success","successfully added a campground")
		res.redirect("/campgrounds");
	}
});
		
});

//new - show the form
router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

//show route

router.get("/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err || !foundCampground ){
			req.flash("error","Campground not found");
			res.redirect("back");
			}
		else{
			res.render("campgrounds/show",{campground: foundCampground});
		}
	});
	
});


//edit route - edit form


router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res)
	   {
	Campground.findById(req.params.id,function(err,foundCampground){
	res.render('campgrounds/edit',{campground: foundCampground });			
	});
});


//update route to db

router.put("/:id",middleware.checkCampgroundOwnership,function(req,res)
	{
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updated)
		{
		
		if(err){
			console.log(err)
			res.redirect("/campgrounds");}
		else{
			console.log("hello")
			res.redirect("/campgrounds/"+req.params.id);
		}
		
	});
	
});

//destroy router
router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndRemove(req.params.id,function(err)
		{
		if(err){res.redirect("/campgrounds");}
		else{
			req.flash("success","Succesfully deleted a campground")
			res.redirect("/campgrounds");
		}
	});
});


module.exports = router;
