const assert = require('assert');
const rp = require('request-promise');
const randtoken = require('rand-token');
const port = 8090;
const serverUrl = "http://localhost:" + port;
const unauthorizedRequestMessage = 'Unauthorized Request';

let cj = rp.jar();


function resetCookie() {
//This line is added to reset Cookie Jar for subsequent tests.
    //todo Find a better mechanism.
    cj = rp.jar();
}

describe("Server", function () {
    let app, server;
    before(function () {
        app = require("../app.js");
        server = app.listen(port);
    });

    after(function () {
        server.close();
    });

    describe("/", function () {

        //Normal Registration
        it("Testing Normal Registration", async function () {
            this.timeout(10000);
            let username = "user_reg_1";
            let password = "pass_reg_1";
            let movie = "movie_reg_1";
            await doRegister(username, password, movie);
            await doLogin(username, password);
            let result = await doViewProfile();
            resetCookie();
            assert(result.body.search(username) >= 0);
        });


        //Disallowed Registration
        it("Testing Disallowed Registration", async function () {
            this.timeout(10000);
            await doViewProfile();
            let username = "user_reg_2";
            let password = "user_reg_2";
            let movie = "user_reg_2";
            await doRegister(username, password, movie);
            let result = await doRegister(username, password, movie);
            resetCookie();
            assert(result.body.search('User name already exists!') >= 0);
        });

        //Basic Edit Profile test
        it("Testing Normal Edit profile functionality", async function () {
            this.timeout(10000);
            let username = "deepika";
            let password = "123";
            let movie = "RDB";
            let new_movie = "RHTDM";
            await doRegister(username, password, movie);
            await doLogin(username, password);
            await editProfile(username, new_movie);
            let result = await doViewProfile();
            resetCookie();
            assert(result.body.search(new_movie) >= 0);
        });

        //Disallowed action in Edit Profile test
        it("Testing disallowed action in Edit profile functionality", async function () {
            this.timeout(10000);
            let username = "deepika";
            let password = "123";
            let movie = "RHTDM"
            let username2 = "deepika123";
            await doLogin(username, password);
            await editProfile(username2, movie);
            let result = await doViewProfile();
            resetCookie();
            assert(result.body.search(username2) < 0);
        });

        //Normal Add Post Test
        //Logged in user should be able to add a new post
        it("Testing Normal Add Post", async function () {
            this.timeout(10000);
            let username = "user_add_post";
            let password = "pass_add_post";
            let postContent = "This a test post for add post";
            await doRegister(username, password, "movie_add_post");
            await doLogin(username, password);
            await addPost(postContent);
            let posts = JSON.parse(await getUserPosts());
            let postUrl = "posts/" + posts[0].id;
            let indexPage = await doGetRequest(serverUrl);
            if(indexPage.body.search(postUrl) >= 0) {
                let postPage = await doGetRequest(serverUrl +  '/' + postUrl);
                resetCookie();
                assert(postPage.body.search(postContent) >= 0);
            }
            else assert(false); //test fail if index page doesn't have the url of the post.
        });

        //Disallowed Add Post Test
        // A user should not be allowed to add post without logging in
        it("Testing Disallowed Add Post", async function () {
            this.timeout(10000);
            let postContent = randtoken.generate(16);
            try {
                await addPost(postContent);
            }
            catch (err) {
                assert(err.statusCode === 401);
            }
            resetCookie();
        });

        //Normal Delete post Test
        //A user should be able to delete his own post
        it("Testing Normal Delete Post", async function () {
            this.timeout(10000);
            let username = "user_delete_post";
            let password = "pass_delete_post";
            let postContent = "This a test post for delete post";
            await doRegister(username, password, "movie_delete_post");
            await doLogin(username, password);
            await addPost(postContent);
            let posts = await getUserPosts();
            await deletePost(JSON.parse(posts)[0].id);
            posts = await getUserPosts();
            resetCookie();
            assert(posts.search(postContent) === -1);
        });

        //Disallowed Delete post Test
        //A user should not be allowed to delete posts of other users
        it("Testing Disallowed Delete Post", async function () {
            this.timeout(10000);
            let username1 = "user_delete_post1";
            let password1 = "pass_delete_post1";
            let postContent = "This a test post for delete post";
            await doRegister(username1, password1, "movie_delete_post");
            await doLogin(username1, password1);
            await addPost(postContent);
            await logout();
            let username2 = "user_delete_post2";
            let password2 = "pass_delete_post2";
            await doRegister(username1, password1, "movie_delete_post");
            await doLogin(username1, password1);
            let posts = await getUserPosts();
            try {
                await deletePost(JSON.parse(posts)[0].id);
            }
            catch (err) {
                assert(err.statusCode === 401);
            }
            resetCookie();
        });

        //Normal restrict post visibility
        //Visibility setting is changed and the post page is checked to reflect this setting.
        it("Testing Normal restrict post visibility", async function () {
            this.timeout(10000);
            let username = "user_rest_1";
            let password = "pass_rest_1";
            let postContent = "This a test post for checking visibility_1";
            await doRegister(username, password, "movie_rest_1");
            await doLogin(username, password);
            await addPost(postContent);
            await changePostVisibility('true');
            let post = JSON.parse(await getUserPosts());
            let postUrl = getPostUrls(post);
            let postPage = await doGetRequest(postUrl[0]);
            assert(postPage.body.search("visibility of the post is :public") >= 0);
        });

        //Disallowed restrict post visibility (Only the owner can see visibility settings.)
        //A user should not be able to see the visibility settings of other user.
        it("Testing Disallowed restrict post visibility", async function () {
            this.timeout(10000);
            let username = "user_rest_2";
            let password = "pass_rest_2";
            let username_2 = "user_rest_2_2";
            let password_2 = "pass_rest_2_2";
            let postContent = "This a test post for checking visibility_2";
            await doRegister(username, password, "movie_rest_2");
            await doRegister(username_2, password_2, "movie_rest_2");
            await doLogin(username, password);
            await addPost(postContent);
            let post = JSON.parse(await getUserPosts());
            let postUrl = getPostUrls(post);
            await logout();
            await doLogin(username_2, password_2);
            let postPage = await doGetRequest(postUrl[0]);
            resetCookie();
            assert(postPage.body.search("visibility of the post is") === -1);
        });

        //Normal view posts by other website users functionality test
        it("Testing Normal view posts by other users", async function () {
            this.timeout(10000);
            let username1 = "user_add_post";
            let password1 = "pass_add_post";
            let postContent = "This is a test post for user 2";
            let username2 = "deepika";
            let password2 = "123";
            await doLogin(username1, password1);
            await addPost(postContent);
            let posts = JSON.parse(await getUserPosts());
            await logout();
            let result=await doLogin(username2, password2);
            let postUrls = getPostUrls(posts);
            let postPage = await doGetRequest(postUrls[0]);
            resetCookie();
            assert(result.body.search(postPage) >= 0 && postPage.body.search(unauthorizedRequestMessage) < 0);
        });

        //Disallowed action in "view posts by other users' functionality test
        //The non members of website are not allowed to view private posts by a user
        it("Testing Disallowed action in 'view posts by other users' functionality", async function () {
            this.timeout(10000);
            let username1 = "user_add_post";
            let password1 = "pass_add_post";
            let postContent = "This is a test post for non member user";
            await doLogin(username1, password1);
            await addPost(postContent);
            await changePostVisibility('false');
            let posts = JSON.parse(await getUserPosts());
            let postUrls = getPostUrls(posts);
            await logout();
            let postPage = await doGetRequest(postUrls[0]);
            resetCookie();
            assert(postPage.body.search(unauthorizedRequestMessage) >= 0);
        });
    });
 });

async function getUserPosts() {
    return (await doGetRequest(serverUrl + "/getposts")).body;
}

async function addPost(postContent) {
    await doPostRequest(serverUrl + "/addpost", {post: postContent});
}

async function editProfile(username,movie) {
    await doPostRequest(serverUrl + "/editProfile", {name:username, movie: movie});
}

async function deletePost(postId) {
    return await doPostRequest(serverUrl + '/deletepost', {id : postId});
}

async function doViewProfile() {
    let viewProfileUrl = serverUrl + "/viewprofile";
    return doGetRequest(viewProfileUrl);
}

async function doRegister(username, password, movie) {
    let registrationUrl = serverUrl + "/register";
    const form = {
        username: username,
        password: password,
        movie: movie
    };
    return await doPostRequest(registrationUrl, form);
}

async function doLogin(username, password) {
    let loginUrl = serverUrl+ "/login";
    let formData = {
        username: username,
        password: password,
    };
    return doPostRequest(loginUrl, formData);
}

async function changePostVisibility(isPublic) {
    return await doPostRequest(serverUrl + '/editprofile', {visibility : isPublic});
}

async function logout() {
    return await doGetRequest(serverUrl + '/logout');
}

function getPostUrls(posts) {
    return posts.map(function(post) {
        return serverUrl + "/posts/" + post.id;
    })
}

async function doPostRequest(url, formData) {
    return await rp({
        followAllRedirects: true,
        method: "POST",
        uri: url,
        resolveWithFullResponse: true,
        form: formData,
        jar: cj
    }).catch(function (error) {
        if(error.name === 'StatusCodeError') {
            return error.response;
        }
        else throw err;
    });
}

async function doGetRequest(url) {
    return await rp({
        followAllRedirects: true,
        method: "GET",
        uri: url,
        resolveWithFullResponse: true,
        jar: cj
    }).catch(function (error) {
         if(error.name === 'StatusCodeError') {
             return error.response;
         }
         else throw err;
     });
}