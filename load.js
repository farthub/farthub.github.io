function loadIndex() {
    var smile_animation = document.getElementById("t3");
    var icons = document.getElementsByClassName("icons")[0];

    console.log("loadIndex called");

    icons.className += " loaded";
    smile_animation.beginElement();
}

// window.onload = loadIndex;

document.onreadystatechange = function () {
    var state = document.readyState
    if (state == 'interactive') {
        document.getElementsByClassName('contents')[0].style.visibility = "hidden";
    } else if (state == 'complete') {
        setTimeout(function () {
            document.getElementsByClassName('load')[0].style.visibility = "hidden";
            document.getElementsByClassName('contents')[0].style.visibility = "visible";
            var fileName = location.pathname.split("/").slice(-1);
            if(fileName[0] === "index.html" || fileName[0] === ""){ // sindura-sriram.github.io/index.html & sindura-sriram/github.io
                loadIndex();
            }
        }, 2000);

    }
}