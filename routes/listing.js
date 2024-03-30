const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js")
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,  isOwner } = require("../middleware.js");
const flash = require("connect-flash");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

const validateListing = (req,res,next)=>{
    let result = listingSchema.validate(req.body);
    
    if(result.error){
        let errMsg = result.error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg)
    }
    else {
        next();
    }
}




// Index Route
router.get("/", wrapAsync(async (req,res) =>{
    const allListings = await  Listing.find({});
    res.render("./listings/index.ejs",{allListings});
}));


//New Route

router.get("/new",isLoggedIn, wrapAsync( async (req,res) =>{
    res.render("./listings/new.ejs" );
}));

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({path : 'reviews', populate: {path : 'author'},}).populate('owner');
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
}));


// create route
router.post("/", isLoggedIn,  upload.single("listing[image]"),validateListing, wrapAsync(async (req, res, next) => {
    if (!req.file) {
        // Handle case where no file was uploaded
        req.flash("error", "No image uploaded");
        return res.redirect("/Listings");
    }

    const { path: url, filename } = req.file;
    
    const newListingData = {
        ...req.body.listing,
        owner: req.user._id,
        image: { url, filename }
    };

    const newListing = new Listing(newListingData);
    
    await newListing.save();
    
    req.flash("success", "New Listing Created!");
    res.redirect("/Listings");
}));

//edit route
router.get("/:id/edit", isLoggedIn ,isOwner, wrapAsync(async (req, res) => {
    try {
        const id = req.params.id;
        const listing = await Listing.findById(id);
        if (!listing) {
            // Handle case where listing is not found
            return res.status(404).send("Listing not found");
        }
        res.render("./listings/edit.ejs", { listing });
    } catch (err) {
        // Handle error
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}));

//update route
router.put("/:id" ,isLoggedIn,isOwner,
upload.single("listing[image]"),
validateListing,wrapAsync(async (req,res) =>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,req.body.listing);
    if(typeof(req.file) != "undefined"){
    let url = req.file.path;
    let filename = req.filename;
    listing.image = {url,filename};
    await listing.save();
    }
    req.flash("success","Updated Successfully!")
    res.redirect(`/listings/${id}`);
}))

//Delete route
router.delete('/:id/del',isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    try {
        const listingId = req.params.id;

        await Listing.findByIdAndDelete(listingId);

        // Send a response back indicating success
        console.log("deleted successfully");
        req.flash("success","Deleted Successfully!")

        res.redirect("/listings");
    } catch (error) {
        // Handle errors here
        console.error(error);
    }
}));

module.exports = router;