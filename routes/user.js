const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { saveRedirectedUrl} = require("../middleware.js");
const passport = require("passport");
const {userSchema} = require("../schema.js")
const User = require("../models/user.js"); // Import User model

const validateUser = (req, res, next) => {
    let result = userSchema.validate(req.body);
    
    if (result.error) {
        let errMsg = result.error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

router.get("/signup",(req,res) =>{
    res.render("./users/signup.ejs")
})

router.post("/signup", validateUser,wrapAsync(async (req,res) => {

    try{
        let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, function(err) {
        if (err) { return next(err); }
        req.flash("success","welcome to wanderLust");
        return res.redirect("/listings");
      });
    
    }
    catch(err){
        req.flash("error","User already exists");
        res.redirect("/signup");
    }
    
}))

router.get("/login",(req,res) => {
    res.render("./users/login.ejs")
})

router.post('/login', 
saveRedirectedUrl,
  passport.authenticate('local', { failureRedirect: '/login' , failureFlash : true}),

  wrapAsync(async (req,res) =>{
    req.flash("success",
    "Welcome to WanderLust! You're logged in and ready to explore!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }));

  router.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash("success","Logged out")
      res.redirect('/listings');
    });
  });


module.exports = router;
  