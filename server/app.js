const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const PORT = 3030;
const DB_PORT = 27017;

const DB_URL = "mongodb://localhost:"+DB_PORT+"/yelp_project";
var campgrounds = [];

mongoose.connect(DB_URL,function(err){
    if(err){ 
       // console.log(err);
    }
});

const campSiteSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var CampSite = mongoose.model("CampSite",campSiteSchema);
//Compile Schema into a model so we can now use create,find, and other methods.

app.use(bodyParser.urlencoded({extended: true}));

app.use( express.static( "public" ));

app.set("view engine", "ejs");

CampSite.find({},function(err,res){
    if(err){
        console.log(err);
    } else{
        for(var i=0; i<res.length; i++){
            campgrounds.push(res[i]);
        }
    }
});

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/campgrounds",function(req,res){
    res.render("campgrounds", {campgrounds: campgrounds});
});

app.post("/campgrounds",function(req,res){
    const newCampground = {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description ? req.body.description : ""
    };
    campgrounds.push(newCampground);
    //add to campgrounds array so we don't need to re-find from database every time campgrounds page is loaded

    const newDBCampground = new CampSite(newCampground);
    newDBCampground.save(function(err,res){
        if(err) console.log(err);
    });

    res.redirect("campgrounds");
});

app.get("/campgrounds/new",function(req,res){
    res.render("new");
});

app.get("/campgrounds/:id",function(req,res){
    CampSite.findById(req.params.id,function(err, foundCampground){
        if(err){
            console.log(err);
            res.redirect("404");
        } else{
            res.render("show",{campground: foundCampground}); 
        }
    });
});

app.get("*",function(req,res){
    res.render("404");
});

app.listen(PORT, function(){
    console.log("Server has started.\nListening on Port:",PORT);
});