const express = require("express");
const router = express.Router({mergeParams:true});
const {isLoggedIn,  isReviewAuthor} = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js")
const Listing = require("../models/listing.js");
const flash = require("connect-flash");


//validate Review

const validateReview = (req,res,next)=>{
    let result = reviewSchema.validate(req.body);
    
    if(result.error){
        let errMsg = result.error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg)
    }
    else {
        next();
    }
}
// review post route

router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; // Changed "-" to "="
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
}));


// Review delete route
router.delete("/:reviewId" , isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review ID from the listing's reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review itself
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

module.exports = router;
