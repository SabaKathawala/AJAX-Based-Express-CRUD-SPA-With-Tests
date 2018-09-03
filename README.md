"# hw2-writing-tests-fsociety" 
    
How to run

install dependencies:
    cd . && npm install

run the tests:
    node_modules/.bin/mocha tests/tests.js

Test Cases Code File
    tests/tests.js
    
Description of all twelve test cases

1.Allow visitors to register a new account with some basic user information which is visible on a user profile page.
  Successful Functionality
  User should be able to register with proper credentials
  1. We perform a proper registration by post request
  2. We perform login with the new username-password created when registering.
  3. We do get request to fetch the view profile page.
  4. We assert if the username is present n the view profile page.
  Successful test will receive correct username displayed when logged in

  Disallowed Functionality
  Username is unique. A register with already existing username should not be allowed.
  1. We perform a proper registration by post request
  2. We perform a second registration with same username-password as in step 1.
  3. Successful test checks for the error "Username already exists"

2. Allow users to edit their own profile* Add users and create profile
  Successful Functionality
  User should be able to edit his profile information
  1. We perform a proper registration by post request
  2. We perform login with the new username-password created when registering.
  3. We perform edit profile with new_movie name.
  4. We do get request to fetch the view profile page and assert if new_movie name is present.
  5. Successful  Test will receive the updated movie name value

  Disallowed Functionality
  Users are not allowed to change their username
  1. We perform a proper registration by post request
  2. We perform login with the new username-password created when registering.
  3. We perform edit profile with username2.
  4. We do get request to fetch the view profile page and assert if username2 is present.
  5. Successful Test will not receive username2

3. Allows users to create new “posts” which each have their own unique URL.
  Successful Functionality
  Adding a new post
  1. We perform a proper registration by post request
  2. We perform login with the new username-password created when registering.
  3. We define a post content.
  4. Do an add post request.
  5. Get the post data from server using a get request from server.
  6. Do a get request for index page.
  7. Check if the post url is present in index page.
  8. Do a get request to access the post via its URL.
  9. Successful test will find new post content added in post page.

  Disallowed Functionality
  A user should not be allowed to add post without logging in
  1. We generate a random content to added as a new post.
  2. Do an add post request.
  3. Server returns an unauthorized request(401).
  4. We assert if '401' error code is received.
  
4. Allow users to restrict their post visibility beyond “all visitors to the web app”
  Making the post private (members only) - allowed functionality.
  Adding a new post
  1. Register and login.
  2. Do add Post.
  3. We change the visibility to private. (Only accessible to logged in members)
  3. Access the post page using the post url.
  4. On success, the post page must have the correct visibility setting displayed.

  Disallowed Functionality - Only the valid user can change the visibility of a post.
  A user should not be able to see the visibility settings of other user.
  1. Login, register, add post (post 1), change visibility to private.
  2. Logout.
  3. Register/login as a new user.
  4. Access the post 1 using the url.
  5. On success, the user must see the post 1 content but not the visibility setting.

5. Allows users to view posts by other users according to visibility rules
  Successful Functionality
  Allow other users to view post by other members of the webapp
  1. We register and login as user1.
  2. We do add Post.
  3. We logout.
  4. We register and login as user2.
  5. User2 should see post from user1

  Disallowed Functionality
  Non-logged Members should only see public posts
  1. Login, register, add post.
  2. Logout and try to access the post by its url.
  3. Server returns an unauthorized request(401).

6.Allows users to delete their own posts
  Successful Functionality
  A user should be able to delete his own post
  1. We perform a proper registration by post request
  2. We perform login with the new username-password created when registering.
  3. We generate a random content to added as a new post.
  4. Do an add post request.
  5. Get the post data from server using a get request from server.
  6. Do a delete post request using post id.
  7. Get the post data from server using a get request from server.
  8. Since the post has been deleted, we assert if the post content is present in the returned posts.
  9. Successful test doesn't find post content in the retrieved posts.

  Disallowed Functionality
  A user should not be allowed to delete posts of other users
  1. We perform a proper registration by post request
  2. We perform login with the new username-password created when registering.
  3. We generate a random content to added as a new post.
  4. Do an add post request.
  5. Logout
  6. We perform a proper registration by post request for a second user.
  7. We perform login with the new username-password created in above step.
  8. Get the post data from server using a get request from server.
  9. All the post retrieved will be of other users.
  10. We delete the post retrieved.
  11. '401' error is returned from server.
  12. Successful test asserts for the same.


 What modules you use, and how you use them ?

* We use express to run the node server,
* we use path to manage the directory paths used to access the views, routes and other files,
* We use morgan for logging,
* We use cookie-parser to manage cookies,
* We use body-parser to access body parameters,
* We use express-session to maintain session for authentication and determination of user,
* We use express-flash to display error messages
* We use rand-token to generate unique tokens and ids.
* We use mocha, request-promise and assert to run our test cases


    Features Implemented by Deepika:
    * Test Cases for functionality 2 and 5
        - Allow users to edit their own profile
        - Allow users to view posts by other users according to visibility rules

    Features Implemented by Akash:
    * Test Cases for functionality 1 and 4
        - Allow visitors to register a new account with some basic user information which is visible on a user profile page.
        - Allow users to restrict their post visibility beyond “all visitors to the web app”

    Features Implemented by Saba:
    * Test Cases for functionality 2 and 6
        - Allows users to create new posts which each have their own unique URL.
        - Allows users to delete their own posts