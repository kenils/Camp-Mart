var express= require("express");
var router= express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware= require("../middleware");//Automatically requires the index.js file inside the directory
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDNAME, 
  api_key: process.env.APIKEY, 
  api_secret: process.env.APISECRET
});



//Index - show all campgrounds
router.get("/",function(req,res){
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name:regex},function(err,allCampgrounds){
			if(err){
				console.log(err);
			}
			else{
				if(allCampgrounds.length <1){
					
					return res.render("campgrounds/index",{campgrounds:allCampgrounds,currentUser:req.user,page:'campgrounds',error:"No Campgrounds found.Please try again"});
				}
				res.render("campgrounds/index",{campgrounds:allCampgrounds,currentUser:req.user,page:'campgrounds'});			
			}
		});

	}

	else{
		//Get all campgrounds from the DB
		Campground.find({},function(err,allCampgrounds){
			if(err){
				console.log(err);
			}
			else{
				res.render("campgrounds/index",{campgrounds:allCampgrounds,currentUser:req.user,page:'campgrounds'});			
			}
		});

	 //res.render("campgrounds",{campgrounds:campgrounds});
	}
});

//Create route - add new campground to db
router.post("/",middleware.isLoggedIn,upload.single('image'),function(req,res){

cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the campground object under image property
  req.body.campground.image = result.secure_url;
  //add image's public id to campground object
  req.body.campground.imageId= result.public_id;
  // add author to campground
  req.body.campground.author = {
    id: req.user._id,
    username: req.user.username
  }
  Campground.create(req.body.campground, function(err, campground) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    res.redirect('/campgrounds/' + campground.id);
  });
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
router.put("/:id",upload.single('image'),middleware.checkCampgroundOwnership ,function(req,res){


	//find and update the correct campground
	Campground.findById(req.params.id,async function(err,campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}
		else{
				if(req.file){
					try{
						await cloudinary.v2.uploader.destroy(campground.imageId);
						var result=await cloudinary.v2.uploader.upload(req.file.path);
						campground.imageId=result.public_id;
						campground.image=result.secure_url;

					} catch(err){
						req.flash("error",err.message);
						return res.redirect("back");
					}	
				}
			campground.name=req.body.name;
			campground.description=req.body.description;
			campground.save();
			req.flash("success","Successfully Updated !");
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
  Campground.findById(req.params.id,async function(err,campground){
  	if(err){
			req.flash("error",err.message);
			return res.redirect("back");
		}
	try{
		await cloudinary.v2.uploader.destroy(campground.imageId);
		campground.remove();
		req.flash('success','Campground Deleted Successfully');
		res.redirect("/campgrounds");
	} catch(err){
		if(err){
			req.flash("error",err.message);
			return res.redirect("back");
		}
	}
  });
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports=router