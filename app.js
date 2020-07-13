var express   =			require("express"),
 app 		  =			express(),
 bodyParser   =			require("body-parser"),
 mongoose     =			require('mongoose'),
 flash		  =   		require("connect-flash"),
 passport     =   		require("passport"),
 LocalStrategy=         require("passport-local"),
 methodOverride=        require("method-override"),
 Campground   =   		require("./models/campground"),
 Comment 	  =			require("./models/comment"),
 User 		  =	        require("./models/user"),
 seedDB	 	  = 		require("./seeds");


//Requiring routes
var commentRoutes    = 	require("./routes/comments"),
	campgroundRoutes =  require("./routes/campgrounds"),
	indexRoutes      = 	require("./routes/index");


//Seed the database
//seedDB();
mongoose.connect("mongodb://localhost:27017/yelp_camp",{useNewUrlParser:true});

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public")); //__dirname represents the current directory
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "$Kenil!$Shah$!",
	resave:false,
	saveUninitialized:false

}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error = req.flash("error");
	res.locals.success= req.flash("success");
	next();
});


//Schema Setup-moved to models/campground.js


//=============================
/*
Campground.create(
	{
		name:"Granite Hill?auto=compress&cs=tinysrgb&h=350",
		description:"This is a huge granite hill, no bathrooms. No water.Beautiful granite!"
	},function(err,campground){
		if(err){",
		image:"https://images.pexels.com/photos/803226/pexels-photo-803226.jpeg
			console.log(err);
		}
		else{
			console.log("Newly created campground");
			console.log(campground);
		}
	}


	);
*/
//======================

/*
 var campgrounds=[
 			{name:"Salmon Creek",image:"https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&h=350"},
 			{name:"Granite Hill",image:"https://images.pexels.com/photos/803226/pexels-photo-803226.jpeg?auto=compress&cs=tinysrgb&h=350"},
 			{name:"Mountain Goat's Rest",image:"https://pixabay.com/get/55e8dc404f5aab14f1dc84609620367d1c3ed9e04e507440712f7bdd944ecc_340.jpg"},
 			{name:"Salmon Creek",image:"https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&h=350"},
 			{name:"Granite Hill",image:"https://images.pexels.com/photos/803226/pexels-photo-803226.jpeg?auto=compress&cs=tinysrgb&h=350"},
 			{name:"Mountain Goat's Rest",image:"https://pixabay.com/get/55e8dc404f5aab14f1dc84609620367d1c3ed9e04e507440712f7bdd944ecc_340.jpg"},
 			{name:"Salmon Creek",image:"https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&h=350"},
 			{name:"Granite Hill",image:"https://images.pexels.com/photos/803226/pexels-photo-803226.jpeg?auto=compress&cs=tinysrgb&h=350"},
 			{name:"Mountain Goat's Rest",image:"https://pixabay.com/get/55e8dc404f5aab14f1dc84609620367d1c3ed9e04e507440712f7bdd944ecc_340.jpg"}
 	];
*/

/*
app.get("/",function(req,res){
res.render("landing");

});

//Index - show all campgrounds
app.get("/campgrounds",function(req,res){
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
app.post("/campgrounds",function(req,res){
	//get data from form and add to campgrounds array
	var name=req.body.name;
	var image=req.body.image;
	var desc=req.body.description;
	var newCampground={name:name,image:image,description:desc};
	//campgrounds.push(newCampground);	
	//Create a new campground and save to database
	Campground.create(newCampground,function(err,newlyCreated){
		if(err){
			console.log(err);
		}
		else
		{
			// redirect back to campgrounds page
			res.redirect("/campgrounds");
		}

	});

});


//New - show form to create new campground
app.get("/campgrounds/new",function(req,res){
	res.render("campgrounds/new.ejs");

});

//Shows more info about oen campground
app.get("/campgrounds/:id",function(req,res){
	//find the campground with the provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
	if(err){
		console.log(err);
	}
	else{

		res.render("campgrounds/show",{campground:foundCampground});
	}
	});

});

//=============
// COMMENT ROUTES
//===============

app.get("/campgrounds/:id/comments/new",isLoggedIn,function(req,res){
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

app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
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
					console.log(err);
				}
				else{
					//Connect new comment to background
					campground.comments.push(comment);
					campground.save();
					//Redirect to campground show page
					res.redirect('/campgrounds/'+campground._id);
				}


			});
		}
	});
	
	
	
});

//===========
//AUTH ROUTES
//===========

//show register form
app.get("/register",function(req,res){
	res.render("register");
});

//handle sign up logic
app.post("/register",function(req,res){

	var newUser = new User({username:req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		else{
			passport.authenticate("local")(req,res,function(){
				res.redirect("/campgrounds");
			});
		}
	});	
});


//Show Login Form

app.get("/login",function(req,res){
	res.render("login");

});

//Handling Login logic
//app.post("/login",middleware,callback)
app.post("/login",passport.authenticate("local",{
	successRedirect: "/campgrounds",
	failureRedirect: "/login"

}),function(req,res){
	
});


app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/campgrounds");


});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

*/


app.use("/",indexRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);


var port=process.env.port || 3000;// process.env.port is useful while hosting as it will assign an available port to the app
app.listen(3000,function(){
	console.log("Server started...");

});