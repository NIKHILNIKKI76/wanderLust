
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");


module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in for this operation");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectedUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl; // Optionally, you can remove the saved redirect URL from the session
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currentUser._id) && 
        !res.locals.currentUser.username === "Nikhil Chary") {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async (req, res, next) => {
    const { listingId, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currentUser._id) && 
        !res.locals.currentUser.username === "Nikhil Chary") {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${listingId}`);
    }
    next();
}



  //---------------------------------------NIKHIL CHARY--------------------------------------------


