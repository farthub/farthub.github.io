var width_;
var height_;
function loadIndex() {;
    var smile_animation = document.getElementById("t3");
    var title = document.getElementsByClassName("title")[0];
    var nav = document.getElementsByClassName("nav")[0];
    var icons = document.getElementsByClassName("icons")[0];
    title.className+= " loaded";
    nav.className+= " loaded";
    setTimeout(function () {
        icons.className+= " loaded";
        smile_animation.beginElement();
    }, 4000);
}