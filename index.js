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
        hiscore:isNaN(parseInt(localStorage.getItem("hiscore"))) ? 0 : parseInt(localStorage.getItem("hiscore")),
        lastTag: {tag: "",imgs:0},
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
        left = parseInt(left);right=parseInt(right)
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
            fetch("https://e621.net/posts.json?limit=1&tags=" + encodeURIComponent(key) + "%20-animation%20-animated%20order%3Arandom&client=esixhigherlower_leo_at_thelmgn_dot_com").then(function(f) {f.json().then(function(j) { 
                imgCache[key] = "url(" + j.posts[0].file.url + ")"
                localStorage.setItem("imgCache",JSON.stringify(imgCache))
            })})
        }
    }
    function render() {
        try {
            document.querySelector("#vleftTagName").innerText = gamestate.lastTag.tag
            document.querySelector("#vleftTagResult").innerText = gamestate.lastTag.imgs.toLocaleString()
            document.querySelector("#vleftImg").style.backgroundImage = getImage(gamestate.lastTag.tag)
            document.querySelector("#leftTagName").innerText = gamestate.leftTag.tag
            document.querySelector("#leftTagResult").innerText = gamestate.leftTag.imgs.toLocaleString()
            document.querySelector("#leftImg").style.backgroundImage = getImage(gamestate.leftTag.tag)
            document.querySelector("#rightTagName").innerText = gamestate.rightTag.tag
            document.querySelector("#rightImg").style.backgroundImage = getImage(gamestate.rightTag.tag)
        } catch(e) {

        }
        
    }

    function renderFrame() {
        render()
        if (!animating) { document.querySelector("#gamePanel").style.transition = "all 0s ease 0s"  }
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
        document.querySelector(".side.panel.right > .innards").classList.remove("final")
        document.querySelector("#lowerBtn").innerText = "Lower"
        gamestate.score = 0
        gamestate.leftTag = random()
        gamestate.rightTag = random()
        gamestate.playing = true
        render()
        document.querySelector("#introPanel").style.display = "none"
        document.querySelector("#gamePanel").style.display = "block"

    }
    var animating = false
    function switchPanel(panel) {
        animating = true
        gamestate.lastTag = gamestate.leftTag
        gamestate.leftTag = gamestate.rightTag
        gamestate.rightTag = panel
        render()
        document.querySelector("#gamePanel").style.animationName = "" 
        document.querySelector("#gamePanel").style.animationName = "slide" 
        
        setTimeout(function() {
            document.querySelector("#gamePanel").style.animationName = "" 
            animating = false
        },500)
    }
    function winstate() {
        gamestate.score += 1
        if (gamestate.score > gamestate.hiscore) { gamestate.hiscore = gamestate.score; localStorage.setItem("hiscore",gamestate.hiscore)}
        document.title = "e6MoL : Score: " + gamestate.score + " HI: " + gamestate.hiscore 
        switchPanel(random())
    }
    function losestate() {
        gamestate.playing = false
        document.querySelector(".side.panel.right > .innards").classList.add("final")
        document.querySelector("#lowerBtn").innerText = "Try again"
        switchPanel({tag: "Final score: " + gamestate.score,imgs:0})
        var shareText = encodeURIComponent("Can you beat my e621 more or less score of " + gamestate.score + "?")
        document.querySelector("#tgButton").href = "https://telegram.me/share/url?text=" + shareText + "&url=" + location.toString()
        document.querySelector("#twButton").href = "https://twitter.com/intent/tweet?text=" + shareText+ "&url=" + location.toString()
        document.querySelector("#shButton").style.display = navigator.share ? "block" : "none"
        document.querySelector("#shButton").onclick = function() {
            navigator.share({title: "Can you beat my score?", text: "I got a score of " + gamestate.score + " in the e621 more or less game. Can you do better?",url: location.toString()}).catch(function() {
                document.querySelector("#shButton").style.display = "block"
                navigator.share = undefined
            })
        }
    }
    document.querySelector("#higherBtn").addEventListener("click",function() {
        if (animating) { return }
        if (!gamestate.playing) { return window.playGame() }
        if (correct(gamestate.leftTag.imgs,gamestate.rightTag.imgs,true)) {
            winstate()
        } else {
            losestate()
        }
    })
    document.querySelector("#lowerBtn").addEventListener("click",function() {
        if (!gamestate.playing) { return window.playGame() }
        if (correct(gamestate.leftTag.imgs,gamestate.rightTag.imgs,false)) {
            winstate()
        } else {
            losestate()
        }
    })
})()

function hideDisclaimer() {
    document.querySelector('#introPanel').style.display = 'block';
    document.querySelector('#disclaimerPanel').style.display = 'none';
    var scriptTag = document.createElement('script');
    scriptTag.src = "https://www.googletagmanager.com/gtag/js?id=UA-71214662-5";
    document.body.appendChild(scriptTag);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-71214662-5');
}