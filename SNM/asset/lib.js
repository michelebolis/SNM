const BASE_URL = "https://api.spotify.com/v1/"
const client_id = "8c847d5d66cd43f28e29a4e4f8d5f1cc"
const client_secret = "62d9042a1da54e519cee47245ccfa8c5"
var URL_TOKEN = "https://accounts.spotify.com/api/token"
/**
 * Collegamento alle API di spotify attraverso l'id e codice segreto del client, 
 * ottenendo un token per effettuare le chiamate API
 */
fetch(URL_TOKEN, {
    method: "POST",
    headers: {
        Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
        "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
})
.then((response) => response.json()).then((tokenResponse) =>
    localStorage.setItem("token", tokenResponse.access_token)
)
var access_token = localStorage.getItem("token") // salvo il token nel local storage

/**
 * 
 * @param {String} titoloAlbum titolo dell'album su cui effettuare la ricerca
 */
function getAlbum(titoloAlbum){
    fetch(`${BASE_URL}search?type=album&q=${titoloAlbum}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then((response) => response.json())
    .then((searchResults) => 
        document.write(
        `<pre>${JSON.stringify(searchResults, null, 2)}</pre>`
        )
    )      
}
/**
 * Funzione che restituisce le 50 track piu ascoltate in Italia
 */
function getTopCharts(){
    fetch(`${BASE_URL}search?type=playlist&q=${'Top 50 - Italy'}&limit=1`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then((response) => response.json())
    .then((searchResults) => 
        getInfoPlaylist(searchResults.playlists.items[0])
    ).catch((e) => console.log(e))
}

/**
 * 
 * @param {*} playlist Data una playlist contenente 
 */
function getInfoPlaylist(playlist){
    fetch(playlist.tracks.href, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then((response) => response.json())
    .then((searchResults) => 
        printPlaylist(searchResults)
    ).catch((e) => console.log(e))
}
/**
 * Funzione che stampa le tracks contenente nella playlist, visualizzate con il titolo, immagine della canzone e nome dell'artista
 * @param {Array} playlist Array contenente le track da stampare
 */
function printPlaylist(playlist){
    template = document.getElementById('top-template').cloneNode(true)
    template.classList.remove("visually-hidden")
    document.getElementById('top').innerHTML=""
    playlist = playlist.items
    console.log(playlist)
    // button template to clone
    button = document.createElement("button")
    button.innerHTML="Show more"
    button.classList.add("show", "btn","btn-secondary")
    
    for (let i=0; i<playlist.length; i+=10){
        // create the button to show more element
        newButton = button.cloneNode(true)
        newButton.id = "showMore_" + i
        newButton.addEventListener("click", showMore)
        //create the row
        row = document.createElement("div")
        row.classList.add("row", "justify-content-center")
        newid = "topRow" + (i/10)
        row.id= newid
        document.getElementById("top").append(row)
        printTracksCard(playlist.slice(i,i+10), template, newid, i+1)
        // append the button and hide everything
        document.getElementById(newid).append(newButton)
        document.getElementById(newid).classList.add("visually-hidden")
    }
    document.getElementById("topRow0").classList.remove("visually-hidden")
    document.getElementById('top-template').remove()
}

function printTracksCard(playlist, template, id, startCount){
    for (let i=0; i<playlist.length; i++){
        clone = template.cloneNode(true)
        clone.addEventListener("click", function move(){window.location.href = "/track?" + playlist[i].track.id})
        clone.id=id + (i + startCount)
        clone.getElementsByClassName("card-img-top")[0].src = playlist[i].track.album.images[0].url
        clone.getElementsByClassName("nome_traccia")[0].innerHTML = "#" + (i+startCount) + " " +playlist[i].track.name
        clone.getElementsByClassName("nome_artista")[0].innerHTML = playlist[i].track.artists[0].name
        document.getElementById(id).appendChild(clone)
    }
}

function showMore(){
    next = (this.parentNode.nextSibling)
    if (next == null){
        this.innerHTML = "Non ci sono piu elementi da mostrare"
    }else{
        next.classList.remove("visually-hidden")
        this.classList.add("visually-hidden")
    }
}

function printMyPlaylists(){
    if (localStorage.getItem("user") == null){return}
    document.write("QUI CI SONO LE MIE PLAYLIST")
}

function printFollowedPlaylists(){
    if (localStorage.getItem("user") == null){return}
    document.write("QUI CI SONO LE PLAYLIST CHE SEGUO")
}

function show_search(){
    search = document.getElementById("search")
    search.classList.remove("visually-hidden")
}
function hide_search(){
    search = document.getElementById("search")
    search.classList.add("visually-hidden")
}

function printNavBar(id){
    navdiv = document.createElement("div")
    title = document.createElement("h3")
    title.innerHTML = "Menu"
    navdiv.appendChild(title)
    if (localStorage.getItem("user") == null){
        node = document.createElement("h5")
        node.innerHTML = "Per accedere alle funzionalità complete, effettua il login o registrati"
        navdiv.append(node)

        node = document.createElement("a")
        node.innerHTML = "Accedi o registrati"
        node.href = "/login.html"
        navdiv.append(node)
    }else{
        node = document.createElement("nav")
        node.classList.add("nav", "flex-column")
        a = document.createElement("a")
        a.classList.add("nav-link")
        a.innerHTML="Home"
        a.href="/"
        node.appendChild(a)

        a = document.createElement("a")
        a.classList.add("nav-link")
        a.innerHTML="Crea una playlist"
        a.href="/"
        node.appendChild(a)

        a = document.createElement("a")
        a.classList.add("nav-link")
        a.innerHTML="Gestisci le tue playlist"
        a.href="/"
        node.appendChild(a)

        a = document.createElement("a")
        a.classList.add("nav-link")
        a.innerHTML="Gestisci il tuo account"
        a.href="/"
        node.appendChild(a)

        a = document.createElement("a")
        a.classList.add("nav-link")
        a.innerHTML="Logout"
        a.addEventListener("click", logout)
        a.href="/"
        node.appendChild(a)

        navdiv.append(node)
    }
    document.getElementById(id).append(navdiv)
}

/**
 * Funzione che, dati i valori contenuti in due input text con id email e password, crea un nuovo utente nel db
 * SE si verificano degli errori, li stampa in un alert 
 */
function addUser(){
    email = document.getElementById("email").value
    password = document.getElementById("password").value
    var data = {
        email: email,
        password: password
    }
    console.log(data)
    fetch("http://127.0.0.1:3100/users?apikey=123456", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(async response => {
        if (response.ok) {
            console.log("SIIIIII")
        } else {
            response.text().then( text =>
                alert(text)
            )
        }
    })
}

function login(){
    email = document.getElementById("login_email").value
    password = document.getElementById("login_password").value
    var data = {
        email: email,
        password: password
    }
    fetch("http://127.0.0.1:3100/login?apikey=123456", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(async response => {
        if (response.ok) {
            localStorage.setItem("user", email)
            window.location.href="/"
        } else {
            response.text().then( text => alert(text) )
        }
    })
}

function save_login(response){
    console.log(response.text())
}

function logout(){
    localStorage.removeItem("user")
}

/**
 * Funzione che stampa in coda al nodo una card placeholder
 * @param {String} id id del node dove fare l'append delle card
 */
function printCardPlaceholder(id){
    div = document.createElement("div")
    div.classList.add("card", "col-3")

    node = document.createElement("div")
    node.classList.add("card-body")
    title = document.createElement("h5")
    title.classList.add("card-title", "placeholder-glow")
    p = document.createElement("p")
    p.classList.add("card-text", "placeholder-glow")

    span = document.createElement("span")
    span.classList.add("placeholder", "col-7")
    p.append(span)
    span = document.createElement("span")
    span.classList.add("placeholder", "col-4")
    p.append(span)
    span = document.createElement("span")
    span.classList.add("placeholder", "col-4")
    p.append(span)
    span = document.createElement("span")
    span.classList.add("placeholder", "col-6")
    p.append(span)
    span = document.createElement("span")
    span.classList.add("placeholder", "col-9")
    p.append(span)

    node.append(title, p)
    div.append(node)

    document.getElementById(id).append(div)
}