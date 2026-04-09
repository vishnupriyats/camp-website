var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//index route - show all items
router.get("/", async function(req, res) {
    try {
        var campgrounds = await Campground.find({});
        res.render("campgrounds/index", {campgrounds: campgrounds});
    } catch(err) {
        console.log(err);
    }
});

//create route-add new items
router.post("/", middleware.isLoggedIn, async function(req, res) {
    try {
        var name = req.body.name;
        var image = req.body.image;
        var desc = req.body.description;
        var price = req.body.price;
        var author = {
            id: req.user._id,
            username: req.user.username
        }
        var newCamp = {name: name, image: image, description: desc, author: author, price: price}
        await Campground.create(newCamp);
        req.flash("success", "Successfully added a campground");
        res.redirect("/campgrounds");
    } catch(err) {
        console.log(err);
    }
});

//new - show the form
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//show route
router.get("/:id", async function(req, res) {
    try {
        var foundCampground = await Campground.findById(req.params.id).populate("comments");
        if(!foundCampground) {
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        res.render("campgrounds/show", {campground: foundCampground});
    } catch(err) {
        req.flash("error", "Campground not found");
        res.redirect("back");
    }
});

//edit route - edit form
router.get("/:id/edit", middleware.checkCampgroundOwnership, async function(req, res) {
    try {
        var foundCampground = await Campground.findById(req.params.id);
        res.render('campgrounds/edit', {campground: foundCampground});
    } catch(err) {
        console.log(err);
    }
});

//update route to db
router.put("/:id", middleware.checkCampgroundOwnership, async function(req, res) {
    try {
        await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
        res.redirect("/campgrounds/" + req.params.id);
    } catch(err) {
        console.log(err);
        res.redirect("/campgrounds");
    }
});

//destroy route
/* router.delete("/:id", middleware.checkCampgroundOwnership, async function(req, res) {
    console.log("DELETE route hit", req.params.id);
    try {
        await Campground.findByIdAndRemove(req.params.id);
        req.flash("success", "Successfully deleted a campground");
        res.redirect("/campgrounds");
    } catch(err) {
        res.redirect("/campgrounds");
    }
}); */

router.delete("/:id", middleware.checkCampgroundOwnership, async function(req, res) {
    console.log("DELETE route hit", req.params.id);
    try {
        var deleted = await Campground.findByIdAndDelete(req.params.id);
        console.log("Deleted:", deleted);
        req.flash("success", "Successfully deleted a campground");
        res.redirect("/campgrounds");
    } catch(err) {
        console.log("Delete error:", err);
        res.redirect("/campgrounds");
    }
});

module.exports = router;