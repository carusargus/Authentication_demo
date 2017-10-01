var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")
    
// mongoose.connect("mongodb://localhost/auth_demo_app"); produces a warning/ error message use this instead:
mongoose.connect('mongodb://localhost/auth_demo_app', { useMongoClient: true }); 

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    //
    //two lines must be provided else you will get err/ warning:  provide saveUninitialized option
    secret: "Corgis are the best", //will be used to ENcode and Decode the sessions used to HASH 
    resave: false,
    saveUninitialized: false
}));


//we need these two lines anytime we use passport it basically sets passport up so it will work in this application 
app.use(passport.initialize());
app.use(passport.session());

//we are using the User.authenticate method that is coming from the user.js file passportLocalMongoose 
passport.use(new LocalStrategy(User.authenticate()));
//These two lines are responsible for READING the session ; encoding the data is Serializing it and putting back in the session 
passport.serializeUser(User.serializeUser());
//taking data that is encoded and unencoding it, thats as the name implies deserializing it 
passport.deserializeUser(User.deserializeUser());

//============
// ROUTES

app.get("/", function(req, res){
    res.render("home");
});

//when a Get request comes into /secret it will run the middleware isLoggedIn BEFORE it does anything else,
//the next argument in the isLoggedIn function will refer to the callback function(req, res)
app.get("/secret",isLoggedIn, function(req, res){
   res.render("secret"); 
});

// Auth Routes

//show sign up form
app.get("/register", function(req, res){
   res.render("register"); 
});
//handling user sign up
app.post("/register", function(req, res){
 //we 1st create a new User object, that is not saved to the DB yet, we only pass in username as it is not a good idea to save a users password into the DB 
    //we pass the user password as a 2nd argument to User.register, which takes this new user & HASHES the password     
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        //this will log the user in, take care of the session, and run the serialize user method 
            //we are using the local STRATEGY, if we wanted to use twitter or facebook strategy we would put those keywords in 
        passport.authenticate("local")(req, res, function(){
           res.redirect("/secret");
        });
    });
});

//LOGIN ROUTES- just render the login page/form---but this must go somewhere so we need a POST route as well
//render login form
app.get("/login", function(req, res){
   res.render("login"); 
});


//Login logic Takes 2 arguments passport.auth and an Object ; this is what is known as "Middleware ": the idea is
//it is some code that runs BEFORE our final callback function...WHen this app gets a post request to "/login"
//it will run this code immediately...The whole point of: passport.authenticate is it authenticates your credentials so it will take the 
//username & pw inside of request.body & will compare the password the user typed in to the crazy HASHED version + Salt in the DB
//middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}) ,function(req, res){
});

app.get("/logout", function(req, res){
     //when we loggout passport is destroying all the user data in the session  so will no longer be able to acces secret page
    req.logout();
    res.redirect("/");
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started.......");
})