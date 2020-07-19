# Camp-Mart

Link for the project - https://mighty-brushlands-51743.herokuapp.com/

This is a full fledged website to get information about various campgrounds uploaded by a User. The following is the list of features implemented in the project:
1.) Authentication - Only logged in user will be able to add campground and comment on a particular post.
2.) Authorization- Only the owner of a campground is allowed to edit post and comments on his particular post.
3.) User Profile: A Dashboard for Users to get information about a User and his uploaded posts
4.) Password Reset Feature via email verification
5.) Feature to add and upload images from local system which will be stored on Cloudinary Cloud Storage.



#Steps to Run the project locally:

================================================================
NOTE: WEBSITE WILL NOT RUN WITHOUT INSTALLING MONGODB AND NODEJS   

================================================================

The whole list of dependancies can be found in the package.json file

Make sure to run "npm install <dependancy_name>" in the command prompt all dependancies after installing Node

Install MongoDB in your system and set the link of directory where it is installed in the System environment variables to access mongo shell commands directly from the command prompt/powershell

Once MongoDB is set up. Open command prompt and type "mongod" and hit Enter.Leave the screen open as it will start the MongoDB server

Open another command prompt window and run the command "mongo" 

Now go to the Project Directory via Command Prompt/ Powershell and run the command "node app.js".

That's it, the website will now be accessible on "localhost:3000/"

Thankyou !
