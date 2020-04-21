(function() {
    var tags
    // get tags
    fetch("./tags.json").then(function(f) {f.json().then(function(j) { 
        tags = j 
        document.querySelector("#play").classList.remove("disabled")
        document.querySelector("#play").innerText = "Play!"
    })})
    var gamestate = {
        playing: false,
        score: 0,
        hiscore:0,
        leftTag, rightTag,
    }
    window.playGame = function() {

    }
})()