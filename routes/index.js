var express = require('express');
var router = express.Router();
/* 
    Define the home page with session management. 
    It returns only public posts in case the user is 
    not loggedd in and all the posts in case of a valid session.
    Provides buttons to login, register or add post functionality depending on "isLoggedIn" status. 
*/
router.get('/getdetails', function(req, res){
    var loggedIn = (req.session && req.session.token);
    var postIds = Object.keys(req.app.locals.posts).filter(function(post) {
        return loggedIn || req.app.locals.posts[post].visibility;
        }
    );
    var posts = postIds.map(function(key){return req.app.locals.posts[key];});
    let username = loggedIn ? req.app.locals.token[req.session.token] : "";
    let movie = loggedIn ? req.app.locals.users[username].movie : "";
    res.send(JSON.stringify({
        title: 'Home',
        user: username,
        movie: movie,
        loggedIn: !!loggedIn,
        posts: posts
    }));
});



//Define the logout functionality
router.get('/logout', function (req, res, next) {
  delete req.session.token;
  rres.send(JSON.stringify({status:'200'}));
});



// Define the view profile page for an authenticated user
router.get('/viewprofile', function(req, res){
    var user = req.app.locals.users[req.app.locals.token[req.session.token]];
    var postIds = req.app.locals.users[user.name].posts;
    var posts = postIds.map(function(id) {
        return req.app.locals.posts[id];
    });
    res.status('200').send(JSON.stringify({
        username: user.name,
        movie : user.movie,
        posts : posts
    }));
});


//Define editprofile page to enable editing favourite movie of the user and display all the posts of the app 
//with the option to delete individual posts
router.get('/editprofile', function(req, res){
    var token = req.session.token;
    var username = req.app.locals.token[token];
    var user = req.app.locals.users[username];
    var postIds = req.app.locals.users[username].posts;
    var posts = postIds.map(function(id) {
    return req.app.locals.posts[id];
    });
   res.send(JSON.stringify({
      username: user.name,
      movie : user.movie,
      posts : posts
    }));
});

router.get('/getposts', function(req, res){
    let token = req.session.token;
    let username = req.app.locals.token[token];
    let user = req.app.locals.users[username];
    let postIds = req.app.locals.users[username].posts;
    let postContent = postIds.map(function(id) {
        return req.app.locals.posts[id];
    });
    res.send(postContent);
});

//Post method defined to update the movie name 
//and visibility of the posts (one setting for all posts)for that user.
router.post('/editProfile', function(req, res) {
    var token = req.session.token;
    var userName = req.app.locals.token[token];
    if (!userName) {
        var error = {status: 401, stack: []};
        error.stack
        error.status
        //var message = "Unauthorized Access";
        //res.status(401);
        res.send(JSON.stringify({status:'401', message:'Unauthorized Access!'}));
    }
    else {
        if (req.body.movie) {
            req.app.locals.users[userName].movie = req.body.movie;
        }
        console.log(req.body.visibility);
        req.app.locals.users[userName].visibility = req.body.visibility;
        var postIds = req.app.locals.users[userName].posts;
        postIds.forEach(function (id) {
            req.app.locals.posts[id].visibility = req.app.locals.users[userName].visibility;
            console.log(req.app.locals.posts[id].visibility );
        });
        res.send(JSON.stringify({status:'200'}));
    }
});


//Post method to delete a specific post of a user.
router.post('/deletepost', function(req, res){
    let token = req.session.token;
    let userName = req.app.locals.token[token];
    let postIds = req.app.locals.users[userName].posts;
    let id= req.body.id;
  
    if (postIds.indexOf(id) === -1) {
        let error = {status: 401, stack: []};
        //let message = "Unauthorized Access";
        //res.status(401);
        res.send(JSON.stringify({status:'401', message:'Unauthorized Access!'}));
    }
    else {
        let index = req.app.locals.users[userName].posts.indexOf(id);
        if (index !== -1)
            req.app.locals.users[userName].posts.splice(index, 1);
        delete req.app.locals.posts[id];
        res.send(JSON.stringify({status:'200'}));
    }
});



//Post method to authenticate the user and allow login.
// It flashes an error message in case the username/password is not valid.
router.post('/login', function (req, res, next) {
  var username = req.body.name;
  var pass = req.body.password;
    if (username && req.app.locals.users[username] && pass && req.app.locals.users[username].pass === pass) {
    req.session.token = req.app.locals.users[username].token;
    res.send(JSON.stringify({status:'200'}))
  } else {
      //req.flash('error2', 'Username and password are incorrect');
      res.send(JSON.stringify({status:'200', message:'Invalid username or password!'}));

  }
});

//Post method to add a new user and create the profile
// It flashes an error message in case of duplicate username. 
router.post('/register', function (req, res, next) {
  var token = req.app.randtoken.generate(16);
  var username = req.body.name;
  if(req.app.locals.users[username]) {
    req.flash('error', 'User name already exists!');
    res.send(JSON.stringify({status:'200', message:'User name already exists!'}));
  }
  else {
      var pass = req.body.password;
      var movie = req.body.movie;
      var user = {
          name: username,
          pass: pass,
          movie: movie,
          token: token,
          posts: [],
          visibility:true
      };

      req.app.locals.users[username] = user;
      req.app.locals.token[token] = username;
      req.app.locals.users[token] = username;
      res.send(JSON.stringify({status:'200'}));
  }
});

//Post method to add a new post for a user.
//New post will be  at members-only visibility level by default.
router.post('/addpost', function (req, res, next) {
    var postId = req.app.randtoken.generate(16);
    var postBody = req.body.post;

    var token = req.session.token;
    var userName = req.app.locals.token[token];
    var visibility = req.app.locals.users[userName].visibility;
    req.app.locals.users[userName].posts.push(postId);

    var post = {
        id: postId,
        value: postBody,
        visibility: visibility
    };
    req.app.locals.posts[postId] = post;
    res.send(JSON.stringify({status:'200'}));
});

//To enable unique url for each post 
router.get('/posts/:postId', function(req, res){
    var postId = req.params.postId;
    var posts = req.app.locals.posts[postId];
    if(!posts || (!posts.visibility && (!req.session || !req.session.token))) {
        var error = {status : 401, stack : []};
        error.stack;
        error.status;
        var message = "Unauthorized Request";
        res.status(401);
        res.send("unauthorized");
    }
    else {
        let currentUser = req.app.locals.token[req.session.token];
        let owner = Object.values(req.app.locals.users).filter(function (user) {
            return user.posts && user.posts.indexOf(postId) >= 0;
        })[0].name;
        let isOwner = owner === currentUser;
        var data = {
            posts: posts,
            visibility: isOwner ? posts.visibility === "true" ? 'public' : 'private' : '',
            owner: owner
        };
        res.send(JSON.stringify(data));
    }
});

module.exports = router;