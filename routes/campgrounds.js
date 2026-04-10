var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
const { body, validationResult } = require("express-validator");

//Input validation and sanitization
var campgroundValidation = [
    body("campground[name]")
        .trim()
        .notEmpty().withMessage("Campground name is required")
        .isLength({min: 3, max: 100}).withMessage("Name must be between 3 and 100 characters"),
    body("campground[price]")
        .trim()
        .notEmpty().withMessage("Price is required")
        .isNumeric().withMessage("Price must be a number")
        .isFloat({min: 0}).withMessage("Price must be a positive number"),
    body("campground[image]")
        .trim()
        .notEmpty().withMessage("Image URL is required")
        .isURL().withMessage("Image must be a valid URL"),
    body("campground[description]")
        .trim()
        .notEmpty().withMessage("Description is required")
        .isLength({min: 10, max: 1000}).withMessage("Description must be between 10 and 1000 characters")
];

//index route - show all items
router.get("/", async function(req, res) {
    try {
        var campgrounds = await Campground.find({});
        res.render("campgrounds/index", {campgrounds: campgrounds});
    } catch(err) {
        console.log(err);
    }
});

//new - show the form
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//create route
router.post("/", middleware.isLoggedIn, campgroundValidation, async function(req, res) {
    try {
        var errors = validationResult(req);
        if(!errors.isEmpty()) {
            errors.array().forEach(function(error) {
                req.flash("error", error.msg);
            });
            return res.redirect("/campgrounds/new");
        }
        var name  = req.body.campground.name;
        var image = req.body.campground.image;
        var desc  = req.body.campground.description;
        var price = req.body.campground.price;
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

//show route
router.get("/:id", middleware.validateId, async function(req, res) {
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

//edit route
router.get("/:id/edit", middleware.validateId, middleware.checkCampgroundOwnership, async function(req, res) {
    try {
        var foundCampground = await Campground.findById(req.params.id);
        res.render('campgrounds/edit', {campground: foundCampground});
    } catch(err) {
        console.log(err);
    }
});

//update route
router.put("/:id", middleware.validateId, middleware.checkCampgroundOwnership, campgroundValidation, async function(req, res) {
    try {
        var errors = validationResult(req);
        if(!errors.isEmpty()) {
            errors.array().forEach(function(error) {
                req.flash("error", error.msg);
            });
            return res.redirect("/campgrounds/" + req.params.id + "/edit");
        }
        await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
        res.redirect("/campgrounds/" + req.params.id);
    } catch(err) {
        console.log(err);
        res.redirect("/campgrounds");
    }
});

//destroy route
router.delete("/:id", middleware.validateId, middleware.checkCampgroundOwnership, async function(req, res) {
    try {
        await Campground.findByIdAndDelete(req.params.id);
        req.flash("success", "Successfully deleted a campground");
        res.redirect("/campgrounds");
    } catch(err) {
        console.log("Delete error:", err);
        res.redirect("/campgrounds");
    }
});

module.exports = router;