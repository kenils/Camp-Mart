//All the middleware goes here
var Campground=require("../models/campground");
var Comment=require("../models/comment");
var middlewareObj={};

middlewareObj.checkCampgroundOwnership=function(req,res,next){
	//is user logged in
		if(req.isAuthenticated()){
		Campground.findById(req.params.id,function(err,foundCampground){
			if(err || !foundCampground){
				req.flash("error","Campground not found");
				res.redirect("back");
			}
			else{
					//does user own campground ?
					if(foundCampground.author.id.equals(req.user._id) || (req.user.isAdmin===true)){
						next();
					}
					else{	//otherwise,redirect
						req.flash("error","You don't have permission to do that");
							res.redirect("back");
					}
				
				}
			});
		}
		else{
			//if not redirect somewhere
			console.log("You need to be logged in");
			res.redirect("back"); //redirects to previous page
		}
}

middlewareObj.checkCommentOwnership=function(req,res,next){
	//is user logged in
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,foundComment){
			if(err || !foundComment){
				req.flash("error","Comment not found");
				res.redirect("back");
			}
			else{
					//does user own comment ?
					if(foundComment.author.id.equals(req.user._id) || (req.user.isAdmin ===true)){
						next();
					}
					else{	//otherwise,redirect
							req.flash("error","You don't have permission to do that");
							res.redirect("back");
					}
				
				}
			});
		}
		else{
			//if not redirect somewhere
			req.flash("error","Please login first");
			res.redirect("back"); //redirects to previous page
		}
		
		
	

}

middlewareObj.isLoggedIn=function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","Please Login first");
	res.redirect("/login");
}



module.exports = middlewareObj;