// this code is very sloppy i wrote it at 3am

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
        leftTag: undefined,
        rightTag: undefined,
    }

    function random() {
        var keys = Object.keys(tags)
        var key = keys[Math.ceil(Math.random() * keys.length)]
        return {tag:key,imgs: tags[key]}
    }
    function correct(left,right,higher) {
        if (higher  & left <= right) { return true }
        if (!higher & left >= right) { return true }
        return false
    }
    function render() {
        document.querySelector("#leftTagName").innerText = gamestate.leftTag.tag
        document.querySelector("#leftTagResult").innerText = gamestate.leftTag.imgs
        document.querySelector("#rightTagName").innerText = gamestate.rightTag.tag
    }

    console.log("here")
    window.playGame = function() {
        if (!tags) return;
        gamestate.leftTag = random()
        gamestate.rightTag = random()
        gamestate.playing = true
        render()
        document.querySelector("#introPanel").style.display = "none"
        document.querySelector("#gamePanel").style.display = "block"

    }
    document.querySelector("")
})()