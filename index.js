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
    window.gamestate = gamestate

    function random() {
        var keys = Object.keys(tags)
        var key = keys[Math.ceil(Math.random() * keys.length)]
        return {tag:key,imgs: parseInt(tags[key])}
    }
    function correct(left,right,higher) {
        if (higher  & left <= right) { return true }
        if (!higher & left >= right) { return true }
        return false
    }
    function getImage(key) {
        if (key.startsWith("Final score")) { return "linear-gradient(to right, rgb(86, 46, 1) 0%, rgb(86, 46, 1) 100%)"}
        if (window.dontshowimages) { return }
        if (imgCache[key]) { return imgCache[key] }
        if (!imgPresent[key]) {
            imgPresent[key] = true
            fetch("https://e621.net/posts.json?limit=1&tags=" + encodeURIComponent(key) + "%20order%3Arandom&client=esixhigherlower_leo_at_thelmgn_dot_com").then(function(f) {f.json().then(function(j) { 
                imgCache[key] = "url(" + j.posts[0].file.url + ")"
                localStorage.setItem("imgCache",JSON.stringify(imgCache))
            })})
        }
    }
    function render() {
        try {
            document.querySelector("#leftTagName").innerText = gamestate.leftTag.tag
            document.querySelector("#leftTagResult").innerText = gamestate.leftTag.imgs
            document.querySelector("#leftImg").style.backgroundImage = getImage(gamestate.leftTag.tag)
            document.querySelector("#rightTagName").innerText = gamestate.rightTag.tag
            document.querySelector("#rightImg").style.backgroundImage = getImage(gamestate.rightTag.tag)
        } catch(e) {

        }
        
    }

    function renderFrame() {
        render()
        requestAnimationFrame(renderFrame)
    }
    renderFrame()

    // obj of imgs that are currently in progress or retrieved
    var imgPresent = {}

    // obj of img that we have the url for
    var imgCache = JSON.parse(localStorage.getItem("imgCache") || "{}")

    console.log("here")
    window.playGame = function() {
        if (!tags) return;
        gamestate.score = 0
        gamestate.leftTag = random()
        gamestate.rightTag = random()
        gamestate.playing = true
        render()
        document.querySelector("#introPanel").style.display = "none"
        document.querySelector("#gamePanel").style.display = "block"

    }
    document.querySelector("#higherBtn").addEventListener("click",function() {
        if (!gamestate.playing) { return window.playGame() }
        if (correct(gamestate.leftTag.imgs,gamestate.rightTag.imgs,true)) {
            gamestate.score += 1;
            gamestate.leftTag = gamestate.rightTag
            gamestate.rightTag = random()
            render()
        } else {
            gamestate.playing = false
            gamestate.leftTag = gamestate.rightTag
            gamestate.rightTag = {tag: "Final score: " + gamestate.score,imgs:0}
            render()
        }
    })
    document.querySelector("#lowerBtn").addEventListener("click",function() {
        if (!gamestate.playing) { return window.playGame() }
        if (correct(gamestate.leftTag.imgs,gamestate.rightTag.imgs,false)) {
            gamestate.score += 1;
            gamestate.leftTag = gamestate.rightTag
            gamestate.rightTag = random()
            render()
        } else {
            gamestate.playing = false
            gamestate.leftTag = gamestate.rightTag
            gamestate.rightTag = {tag: "Final score: " + gamestate.score,imgs:0}
            render()
        }
    })
})()