var presentation_window = null
var presenting = false
var presenting_progress = 0
var presenting_id = 0
var random_id_order = [0]
var slide_time = 10000
var slide_start_time = 0

function createWindow(id) {
    if (presentation_window == null || presentation_window.closed) {
        let url = "/presentation_window/" + id
        presentation_window = window.open(url, "presentationWindow", "location=no,menubar=no,resizable=yes,scrollbars=no,status=no,toolbar=no")
        return true
    }
    return false
}

function setWindowContent(id) {
    let isNew = createWindow(id)
    if (!isNew) {
        let url = "/presentation_window/" + id
        presentation_window.window.htmx.ajax("GET", url, {target: "body", swap: "swap:1s settle:1s"})
    }
}

function onButtonClick(evt) {
    setWindowContent(evt.target.dataset.id)
    stopPresenting()
    document.getElementById("slideshow-progress").style.width = presenting_progress + "%"
}

function togglePresenting() {
    if (presenting) {
        stopPresenting()
    } else {
        startPresenting()
    }
}

function startPresenting() {
    if (presenting) {
        return
    }
    setWindowContent(random_id_order[presenting_id])
    presenting = true
    document.getElementById("start-slideshow").innerText = "Slideshow stoppen"
    slide_start_time = Date.now()
}

function stopPresenting() {
    if (!presenting) {
        return
    }
    presenting = false
    document.getElementById("start-slideshow").innerText = "Slideshow starten"
    presenting_progress = 0
    document.getElementById("slideshow-progress").style.width = "0%"
}

function stepPresentation() {
    if (!presenting) {
        return
    }
    if (presentation_window.closed) {
        stopPresenting()
        return
    }
    presenting_progress = Math.floor((Date.now() - slide_start_time) * 100 / slide_time)
    document.getElementById("slideshow-progress").style.width = presenting_progress + "%"
    if (presenting_progress >= 100) {
        presenting_id += 1
        presenting_progress = 0
        if (presenting_id >= random_id_order.length) {
            presenting_id = 0
        }
        slide_start_time = Date.now()
        setWindowContent(random_id_order[presenting_id])
    }
}

function setPresentationSpeed(evt) {
    slide_time = evt.target.value * 1000
}

function getIdOrder(category_id = -1) {
    let url = "/presentation_order"
    if (category_id >= 0) {
        url = url + "?c=" + category_id
    }
    fetch(url).then(res => res.json()).then(out => random_id_order = out)
}

setInterval(stepPresentation, 100)

addEventListener("DOMContentLoaded", function() {
    document.getElementById("start-slideshow").addEventListener("click", togglePresenting)
    document.getElementById("slideshow-time").addEventListener("change", setPresentationSpeed)
    for (let element of document.querySelectorAll(".show-btn")) {
        element.addEventListener("click", onButtonClick)
        element.setAttribute("event-set", "true")
    }
    document.getElementById("presentation_category").addEventListener("change", (evt) => {getIdOrder(evt.target.value)})
    getIdOrder()
})

addEventListener("htmx:afterSettle", function() {
    for (let element of document.querySelectorAll(".show-btn")) {
        if (element.getAttribute("event-set") !== "true") {
            element.addEventListener("click", onButtonClick)
            element.setAttribute("event-set", "true")
        }
    }
})