// Open Sub Menu
$(".drp_btn").on('click', function() {
    $(this).siblings(".sub_menu").slideToggle();
    $(this).toggleClass('rotate');
});

// Preloader JS
function preloader_fade() {
    $("#preloader").fadeOut("slow");
}

$(document).ready(function() {
    window.setTimeout("preloader_fade();", 500); //call fade in .5 seconds
});


// Go Top
$(document).ready(function() {
    $('#Gotop').on('click', function() {
        let windiowTop = $(window).scrollTop();
        if (windiowTop <= 1000) {
            $('body,html').animate({
                scrollTop: 0
            }, 1000);
        } else if (windiowTop <= 2000 && windiowTop > 1000) {
            $('body,html').animate({
                scrollTop: 0
            }, 2000);
        } else {
            $('body,html').animate({
                scrollTop: 0
            }, 2500);
        }
    });
});
$(window).scroll(function() {
    let windiowTop = $(window).scrollTop();
    console.log(windiowTop);
    if (windiowTop > 300) {
        $('#Gotop').fadeIn(500);
    } else {
        $('#Gotop').fadeOut(500);
    }
});
// Fix Header Js
var header_height = $('header').outerHeight();
$(window).scroll(function() {
    if ($(window).scrollTop() >= 50) {
        $("header").addClass("fix_style");
    } else {
        $("header").removeClass("fix_style");
    }
});
$('.navbar-toggler').on('click', function() {
    $('body').toggleClass('hide_scroll');
});
//YOUTUBE VIDEO
$(".play-button").on('click', function(e) {
    var iframeEl = $("<iframe>", {
        src: $(this).data("url")
    });
    $("#youtubevideo").attr("src", $(this).data("url"));
});
$("#close-video").on('click', function(e) {
    $("#youtubevideo").attr("src", "");
});
$(document).on("hidden.bs.modal", "#myModal", function() {
    $("#youtubevideo").attr("src", "");
});
// Close btn on click
$(document).ready(function() {
    $(".navbar-toggler").on('click', function() {
        if ($(this)
            .children("span")
            .children(".ico_menu")
            .hasClass("icofont-navigation-menu")) {
            $(this)
                .children("span")
                .children(".ico_menu")
                .removeClass("icofont-navigation-menu")
                .addClass("icofont-close");
        } else {
            $(this)
                .children("span")
                .children(".ico_menu")
                .removeClass("icofont-close")
                .addClass("icofont-navigation-menu");
        }
    });
});
(function() {
    $(".toggle-wrap").on("click", function() {
        $(this).toggleClass("active");
        $("aside").animate({
            width: "toggle"
        }, 200);
    });
})();
// INITIALIZE AOS
AOS.init();