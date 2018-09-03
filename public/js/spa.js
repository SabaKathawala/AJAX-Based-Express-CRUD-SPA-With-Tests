$(document).ready(function() {
    $("#edit").on("click", function(event) {
        $('div').addClass("inactive");
        $('div').removeClass('active');

        let id = "#"+ $(this).attr("id") + "Div";
        $(id).removeClass("inactive");
        $(id).addClass("active");
        setisLoggedVisibilityStatus(true);

        $.ajax({
            type: "GET",
            url: "/editProfile",
        }).done(function(data) {

            data = JSON.parse(data);
            $("#movie").val(data.movie);
            $("#posts").empty();
            data.posts.forEach(function (post) {
                let p = $("<p>");
                $(p).text(post.value);
                let input = $("<input>");
                $(input).attr('type','button');
                $(input).attr('value','Delete Post');
                $(input).attr('id',post.id);
                $(input).attr('name','id');
                $("#posts").append(p);
                $("#posts").append(input);
            })
        });
    });

    $("#view").on("click", function(event) {
        $('div').addClass("inactive");
        $('div').removeClass('active');
        setisLoggedVisibilityStatus(true);

        let id = "#"+ $(this).attr("id") + "Div";
        $(id).removeClass("inactive");
        $(id).addClass("active");

        $.ajax({
            type: "GET",
            url: "/viewProfile",
        }).done(function(data) {
            data = JSON.parse(data);
            $("#view_username").text(data.username);
            $("#view_movie").text(data.movie);
            $("#viewPosts").empty();
            data.posts.forEach(function (post) {
                let v = $("<i>");
                let visibility = post.visibility === "true" ? 'public' : 'private';
                console.log(post.visibility);
                console.log(visibility);
                $(v).text("visibility : " + visibility);
                let p = $("<p>");
                $(p).text(post.value);
                $(p).append("<br>").append(v);
                $("#viewPosts").append(p);
            })
        });
    });

    $("#home").on("click", function(event) {
        window.location.reload();
    });

    $("#logout").on("click", function(event) {
        $.ajax({
            type: "GET",
            url: "/logout",
        });
        window.location.reload();
    });

    $('body').on("click", "a[name='postView']", function(event) {
        event.preventDefault();
        let element = this;
        let contentId = element.id + "content";
        let previous_content = $('#' + contentId);
        if(previous_content.length === 0) {
            $.ajax({
                type: "GET",
                url: this.href,
            }).done(function (post) {
                post = JSON.parse(post);
                let newContent = $("<p>");
                $(newContent).text(post.posts.value);

                // if (post.visibility) {
                    let visibilityStatus = $("<i>");
                    $(visibilityStatus).text("visibility : " + post.visibility);
                    $(newContent).append("<br>").append(visibilityStatus);
                // }
                if (post.owner) {
                    let owner = $("<b>");
                    $(owner).text("Owner : " + post.owner);
                    $(newContent).append("<br>").append(owner);
                }
                $(newContent).attr('id', contentId);
                $(element).after(newContent);
            })
        }
        else previous_content.remove();
    });


    $( "#editProfile" ).submit(function( event ) {
        event.preventDefault();
        // alert( "Handler for .submit() called." );
        let movie_name = $("#movie").val();
        let visibility = $("input:checked").val();
        console.log(visibility);
        let data = {
            movie : movie_name,
            visibility : visibility
        };
        $.ajax({
            type: "POST",
            url: "/editProfile",
            data: data
        }).done(function(data) {
            data = JSON.parse(data);
            $("#home").trigger("click");
        });
    });
    $("#add").on("click", function(event) {
        $('div').addClass("inactive");
        $('div').removeClass('active');

        let id = "#"+ $(this).attr("id") + "Div";
        //Making the posts visible.
        $('#postContent').removeClass("inactive");
        $('#postContent').addClass("active");
        setisLoggedVisibilityStatus(true);
        $(id).removeClass("inactive");
        $(id).addClass("active");
    });

    $("#reg").on("click", function(event) {
        $('div').addClass("inactive");
        $('div').removeClass('active');
        setisLoggedVisibilityStatus(false);
        let id = "#"+ $(this).attr("id") + "Div";
        $(id).removeClass("inactive");
        $(id).addClass("active");
    });

    $("#log").on("click", function(event) {
        $('div').addClass("inactive");
        $('div').removeClass('active');
        setisLoggedVisibilityStatus(false);
        let id = "#"+ $(this).attr("id") + "Div";
        $(id).removeClass("inactive");
        $(id).addClass("active");
    });

    $( "#registerUser" ).submit(function( event ) {
        event.preventDefault();
        $("#error").text("");
        // alert( "Handler for .submit() called." );
        let user_name = $("#name").val();
        let password = $("#password").val();
        let movie_name = $("#movies").val();
        let data= {
            name : user_name,
            password : password,
            movie : movie_name
        };
        $.ajax({
            type: "POST",
            url: "/register",
            data: data
        }).done(function(data) {
            data = JSON.parse(data);
            if(data.message) {
                $("#error").text(data.message);
                $("#error").addClass('active');
                $("#error").removeClass('inactive');
            }
            else {
                $("#log").trigger("click");
            }
        });
    });

    $( "#loginUser" ).submit(function( event ) {
        event.preventDefault();
        $("#error2").text("");
        // alert( "Handler for .submit() called." );
        let user_name = $("#username").val();
        let password = $("#pass").val();
        let data = {
            name : user_name,
            password : password
        };
        $.ajax({
            type: "POST",
            url: "/login",
            data: data
        }).done(function(data) {
            data = JSON.parse(data);
            if(data.message) {
                $("#error2").text(data.message);
                $("#error2").addClass('active');
                $("#error2").removeClass('inactive');
            }
            else{
                window.location.reload();
            }
        });
    });

    $( "#addPost" ).submit(function( event ) {
        event.preventDefault();
        // alert( "Handler for .submit() called." );
        let post = $("#post").val();
        let data = {
            post:post
        }
        $.ajax({
            type: "POST",
            url: "/addpost",
            data: data
        }).done(function(data) {
            data = JSON.parse(data);
            $("#home").trigger('click');
        });
    });

    $(document).on("click", "input[name='id']", function(){
        var id = $(this).attr("id");
        let data = {
            id : id
        };
        $.ajax({
            type: "POST",
            url: "/deletepost",
            data: data
        }).done(function(data) {
            $("#edit").trigger("click");
        });
    });

    // A $( document ).ready() block.
    $( document ).ready(function() {
        console.log( "ready!" );
        $.ajax({
            type: "GET",
            url: "/getdetails",
        }).done(function(data) {
            console.log(data);
            data = JSON.parse(data);
            setisLoggedVisibilityStatus(data.loggedIn);
            $('.movieDisplay').text( "Favourite Movie: " + data.movie);
            $('.welcome').text( "Welcome: " + data.user);

            data.posts.forEach(function (post) {
                let p = $("<a>");
                $(p).text(post.value);
                $(p).attr('name','postView');
                $(p).attr('href',"posts/" + post.id);
                $(p).attr('id',post.id + "index");
                $("#postData").append(p);
                $("#postData").append("</br>");
            })

        })
    });

    function setisLoggedVisibilityStatus(isLoggedIn) {
        //Removing all previous settings
        $("#logged").removeClass('active');
        $("#logged").removeClass('inactive');
        $("#notLogged").removeClass('active');
        $("#notLogged").removeClass('inactive');

        if(isLoggedIn === true) {
            $("#logged").addClass("active");
            $("#notLogged").addClass('inactive');
            console.log("logged")
        }
        else {
            $("#logged").addClass("inactive");
            $("#notLogged").addClass('active');
            console.log("not")
        }
    }
});
