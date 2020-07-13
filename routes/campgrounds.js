var express= require("express");
var router= express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware= require("../middleware");//Automatically requires the index.js file inside the directory

//Index - show all campgrounds
router.get("/",function(req,res){
//Get all campgrounds from the DB
Campground.find({},function(err,allCampgrounds){
	if(err){
		console.log(err);
	}
	else{
		res.render("campgrounds/index",{campgrounds:allCampgrounds,currentUser:req.user});			
	}
});

 //res.render("campgrounds",{campgrounds:campgrounds});

});

//Create route - add new campground to db
router.post("/",function(req,res){
	//get data from form and add to campgrounds array
	var name=req.body.name;
	var price=req.body.price;
	var image=req.body.image;
	var desc=req.body.description;
	var author={
		id: req.user._id,
		username: req.user.username
	}
	var newCampground={name:name,price:price,image:image,description:desc,author:author};
	//campgrounds.push(newCampground);	
	//newCampground.author.id=req.user._id;
	//newCampground.author.username=req.user.username;
	//Create a new campground and save to database
	Campground.create(newCampground,function(err,newlyCreated){
		if(err){
			console.log(err);
		}
		else
		{
			// redirect back to campgrounds page
			console.log(newlyCreated)
			res.redirect("/campgrounds");
		}

	});

});


//New - show form to create new campground
router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new.ejs");

});

//SHOW-Shows more info about oen campground
router.get("/:id",function(req,res){
	//find the campground with the provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
	if(err || !foundCampground){
		req.flash("error","Campground not found");
		res.redirect("back");
	}
	else{
		//render show template with that campground
		res.render("campgrounds/show",{campground:foundCampground});
	}
	});

});

//Edit Campground Route
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
	//is user logged in	
	Campground.findById(req.params.id,function(err,foundCampground){
		res.render("campgrounds/edit",{campground:foundCampground});

	});

});

//Update Campground Route
router.put("/:id",middleware.checkCampgroundOwnership ,function(req,res){
	//find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds/"+req.params.id);
		}


	});


});


// Destroy Campground Route
/*router.delete("/:id",function(req,res){
	Campground.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}
		else{

			res.redirect("/campgrounds");
		}
	});
});*/
//===New Code==========
router.delete("/:id",middleware.checkCampgroundOwnership,async(req, res) => {
  try {
    let foundCampground = await Campground.findById(req.params.id);
    await foundCampground.remove();
    req.flash("success","Campground removed successfully !")
    res.redirect("/campgrounds");
  } catch (error) {
    console.log(error.message);
    res.redirect("/campgrounds");
  }
});

/*
//middleware
 

function checkCampgroundOwnership(req,res,next){
	//is user logged in
		if(req.isAuthenticated()){
		Campground.findById(req.params.id,function(err,foundCampground){
			if(err){
				console.log(err);
				res.redirect("back");
			}
			else{
					//does user own campground ?
					if(foundCampground.author.id.equals(req.user._id)){
						next();
					}
					else{
							res.redirect("back");
					}
				
				}
			});
		}
		else{
			console.log("You need to be logged in");
			res.redirect("back"); //redirects to previous page
		}
		
		//otherwise,redirect
	//if not redirect somewhere

}
*/

module.exports=router