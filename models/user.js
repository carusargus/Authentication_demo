var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");



var UserSchema = new mongoose.Schema({
    username:String,
    password:String
});

//This takes our passportLocalMongoose Package and will add a bunch of methods that come with this package 
UserSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model("User", UserSchema); 