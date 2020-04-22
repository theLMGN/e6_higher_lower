// this code is very sloppy i wrote it at 3am
if (location.protocol == "http:" && location.host == "thelmgn.com") { location.protocol = "https:"}
document.ontouchmove = function(e){ 
    if (e.preventDefault) {e.preventDefault();}
    return false 
}
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
        document.querySelector("#vleftTagResult").innerText = gamestate.lastTag.imgs.toLocaleString()
        document.querySelector("#leftTagResult").innerText = gamestate.leftTag.imgs.toLocaleString()

        document.querySelector("#vleftTagName").innerText = gamestate.lastTag.tag
        document.querySelector("#leftTagName").innerText = gamestate.leftTag.tag
        document.querySelector("#rightTagName").innerText = gamestate.rightTag.tag

        document.querySelector("#vleftImg").style.backgroundImage = getImage(gamestate.lastTag.tag)
        document.querySelector("#leftImg").style.backgroundImage = getImage(gamestate.leftTag.tag)
        document.querySelector("#rightImg").style.backgroundImage = getImage(gamestate.rightTag.tag)

        document.querySelector("#leftSauce").style.display = getImage(gamestate.leftTag.tag) ? "block" : "none"
        document.querySelector("#leftSauce").href = "https://e621.net/posts?tags=md5%3A" + getImage(gamestate.leftTag.tag).split("/")[6].split(".")[0]
        document.querySelector("#rightSauce").style.display = getImage(gamestate.rightTag.tag) ? "block" : "none"
        document.querySelector("#rightSauce").href = "https://e621.net/posts?tags=md5%3A" + getImage(gamestate.rightTag.tag).split("/")[6].split(".")[0]
    } catch(e) {

    }
    
}

function renderFrame() {
    render()
    if (!animating) { document.querySelector("#gamePanel").style.transition = "all 0s ease 0s"  }
    // fucking safari
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.scrollTo(0,0)
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
    try {ga('send', 'event', 'Game', 'Start', 'gameStarted', {transport: 'beacon'});} catch(e) {}
    document.querySelector(".side.panel.right > .innards").classList.remove("final")
    document.querySelector("#lowerBtn").innerText = "Less"
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
    if (window.matchMedia("(orientation:portrait)").matches) {
        gamestate.lastTag = gamestate.leftTag
        gamestate.leftTag = gamestate.rightTag
        gamestate.rightTag = panel
        render()
        document.querySelector("#gamePanel").style.animationName = "" 
        return 
    }
    animating = true
    gamestate.lastTag = gamestate.leftTag
    gamestate.leftTag = gamestate.rightTag
    gamestate.rightTag = panel
    render()
    document.querySelector("#gamePanel").style.animationName = "" 
    document.querySelector("#gamePanel").style.animationName = window.matchMedia("(orientation:portrait)").matches ? "slideV" : "slide" 
    
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
    try { ga('send', 'event', 'Game', 'lose', 'Game Lost', gamestate.score, {transport: 'beacon'}); } catch(e) {}
    gamestate.playing = false
    document.querySelector(".side.panel.right > .innards").classList.add("final")
    document.querySelector("#lowerBtn").innerText = "Try again"
    switchPanel({tag: "Final score: " + gamestate.score,imgs:0})
    var shareText = encodeURIComponent("Can you beat my e621 more or less score of " + gamestate.score + "?")
    document.querySelector("#tgButton").href = "https://telegram.me/share/url?text=" + shareText + "&url=" + location.toString()
    document.querySelector("#tgButton").onclick = function() {
        ga('send', 'event', 'Share', 'Telegram', 'Attempt', {transport: 'beacon'});
    }
    document.querySelector("#twButton").href = "https://twitter.com/intent/tweet?text=" + shareText+ "&url=" + location.toString()
    document.querySelector("#twButton").onclick = function() {
        ga('send', 'event', 'Share', 'Twitter', 'Attempt', {transport: 'beacon'});
    }
    document.querySelector("#shButton").style.display = navigator.share ? "block" : "none"
    document.querySelector("#shButton").onclick = function() {
        try { ga('send', 'event', 'Share', 'Native', 'Attempt', {transport: 'beacon'}); } catch(e) {}
        var p = navigator.share({title: "Can you beat my score?", text: "I got a score of " + gamestate.score + " in the e621 more or less game. Can you do better?",url: location.toString()})
        p.catch(function() {
            document.querySelector("#shButton").style.display = "block"
            navigator.share = undefined
            ga('send', 'event', 'Share', 'Native', 'Fail', {transport: 'beacon'});
        })
        p.then(function() {
            ga('send', 'event', 'Share', 'Native', 'Succeed', {transport: 'beacon'});
        })
    }
}

function hideDisclaimer(imgs) {
    document.querySelector('#introPanel').style.display = 'block';
    document.querySelector('#disclaimerPanel').style.display = 'none';
    (function(e,s,i,x,m,o,l){e['GoogleAnalyticsObject']=m;e[m]=e[m]||function(){
    (e[m].q=e[m].q||[]).push(arguments)},e[m].l=1*new Date();o=s.createElement(i),
    l=s.getElementsByTagName(i)[0];o.async=1;o.src=x;l.parentNode.insertBefore(o,l)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    
    ga('create', 'UA-71214662-5', 'auto');
    ga('send', 'pageview');

    ga('send', 'event', 'Disclaimer', 'Dismissed', imgs ? "ImagesShown" : "ImagesHidden", {transport: 'beacon'});
    setTimeout(function() {
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
    })
}

document.onscroll = function() {
    document.scrollingElement.scrollTop = 0
    window.scrollTo(0,0)
}