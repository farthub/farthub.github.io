document.onreadystatechange = function () {
    var state = document.readyState
    if (state == 'interactive') {
        document.getElementById('contents').style.visibility = "hidden";
    } else if (state == 'complete') {
        setTimeout(function () {
            document.getElementById('interactive');
            document.getElementsByClassName('load')[0].style.visibility = "hidden";
            document.getElementById('contents').style.visibility = "visible";
            var fileName = location.pathname.split("/").slice(-1);
            if(fileName[0] === "index.html"){
                loadIndex();
            }
        }, 2000);
        
    }
}