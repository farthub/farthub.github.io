window.onload = function () {
    var smile_animation = document.getElementById("t3");
    var icons = document.getElementsByClassName("icons")[0];

    setTimeout(function () {
        icons.className += " loaded";
        smile_animation.beginElement();
    }, 4000);
};