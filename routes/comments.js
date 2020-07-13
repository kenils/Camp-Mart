var express= require("express");
var router = express.Router({mergeParams:true}); //If mergeParams is not written the Id inside URL will not be recognized in the route files	
var Campground= require("../models/campground");
var Comment = require("../models/comment");
var middleware= require("../middleware");//Automatically requires the index.js file inside the directory

//Comments New
router.get("/new",middleware.isLoggedIn,function(req,res){
	//Find Campground By Id
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/new",{campground:campground});
		}

	});

});

//Comments create
router.post("/",middleware.isLoggedIn,function(req,res){
	//Lookup the campground using ID
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}
		else{
			//Create new comment
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					req.flash("error","Something went wrong");
					console.log(err);
				}
				else{
					
					//add username and id to comment
					comment.author.id=req.user._id;
					comment.author.username= req.user.username;
					//save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					//Redirect to campground show page
					req.flash("success","Comment addded successfully");
					res.redirect('/campgrounds/'+campground._id);
				}


			});
		}
	});
	
});

//Comment Edit Route
router.get("/:comment_id/edit",middleware.checkCommentOwnership,async function(req,res){
	try{
	let foundCampground= await Campground.findById(req.params.id);
	if(!foundCampground){
		req.flash("error","No Campground found !");
		res.redirect("back");
		return;
	}	
	let foundComment=await Comment.findById(req.params.comment_id);
	if(!foundComment){
		req.flash("error","No comment found");
		res.redirect("back");
		return;
	}
	res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
	}
	catch(error)
	{	
		console.log(error.message);
		res.redirect("back");
	}
});

//Comment Update Route
router.put('/:comment_id',middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err){
			res.redirect("back");
		}
		else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

//Comment Delete Route
router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	//FindByIdAndRemove
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			console.log(err);
			res.redirect("back");
		}
		else{
			req.flash("success","Comment Deleted");
			res.redirect("/campgrounds/"+req.params.id);
		}
	});

});

/*
//middleware
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}



function checkCommentOwnership(req,res,next){
	//is user logged in
		if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,foundComment){
			if(err){
				console.log(err);
				res.redirect("back");
			}
			else{
					//does user own comment ?
					if(foundComment.author.id.equals(req.user._id)){
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






module.exports=router;