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
        clone.addEventListener("click", function move(){window.location.href = "/src/track.html?" + playlist[i].track.id})
        clone.id=id + (i + startCount)
        clone.getElementsByClassName("card-img-top")[0].src = playlist[i].track.album.images[0].url
        clone.getElementsByClassName("nome_traccia")[0].innerHTML = "#" + (i+startCount) + " " +playlist[i].track.name
        clone.getElementsByClassName("nome_artista")[0].innerHTML = playlist[i].track.artists[0].name
        document.getElementById(id).appendChild(clone)
    }
}

/**
 * Visualizza il nodo successivo rispetto a quello del padre
 */
function showMore(){
    next = (this.parentNode.nextSibling)
    if (next == null){
        this.innerHTML = "Non ci sono piu elementi da mostrare"
    }else{
        next.classList.remove("visually-hidden")
        this.classList.add("visually-hidden")
    }
}

async function printTrackInfo(idTrack, idNode){
    fetch(`${BASE_URL}tracks/${idTrack}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(response => response.json())
    .then(function(info){
        console.log(info)
        node = document.createElement("div")
        node.classList.add("row", "justify-content-center")
        title = document.createElement("h3")
        title.innerHTML = "Titolo: " + info.name
        node.append(title)
        
        left = document.createElement("div")
        left.classList.add("col-4", "col-sm-12", "col-md-4",)
        right = document.createElement("ul")
        right.classList.add("col-8","col-sm-12", "col-md-7", "list-group","list-group-flush")
        img = document.createElement("img")
        img.style="width:100%"
        img.src = info.album.images[1].url
        left.append(img)

        div = document.createElement("li")
        div.classList.add("list-group-item", "list-group-item-dark")
        div.innerHTML="Artisti: "
        for (let i=0; i<info.artists.length; i++){
            a = document.createElement("a")
            a.addEventListener("click", function show(){window.location.href="/src/artist?"+info.artists[i].id})
            a.innerHTML = info.artists[i].name 
            a.classList.add("link")
            div.append(a)
            i+1<info.artists.length ? div.append(document.createElement("div").innerHTML=" e ") : null
        }
        right.append(div)

        div = document.createElement("li")
        div.classList.add("list-group-item", "list-group-item-dark")
        div.innerHTML = "Album: "
        a = document.createElement("a")
        a.name = info.album.name
        a.addEventListener("click", function move(){window.location.href="/src/album?"+info.album.id})
        a.classList.add("link")
        div.append(a)
        right.append(div)

        div = document.createElement("li")
        div.classList.add("list-group-item", "list-group-item-dark")
        div.innerHTML = "Durata: " + msToMinutesAndSeconds(info.duration_ms)
        right.append(div)

        div = document.createElement("li")
        div.classList.add("list-group-item", "list-group-item-dark")
        div.innerHTML = "Preview: </br>"
        div.style="vertical-align: middle;"
        audio = document.createElement("audio")
        audio.controls="controls"
        source = document.createElement("source")
        source.src = info.preview_url
        source.type = "audio/mpeg"
        audio.append(source)
        audio.style="width:100%;"
        div.append(audio)
        right.append(div)

        div = document.createElement("li")
        div.classList.add("list-group-item", "list-group-item-dark")
        div.innerHTML = "Aggiungi alla playlist: "
        button = document.createElement("button")
        button.innerHTML="Aggiungi"
        button.classList.add("btn", "btn-primary", "btn-light")
        div.append(button)
        select = document.createElement("select")
        select.classList.add("form-select")
        select.style = "width:50%"
        option = document.createElement("option")
        option.innerHTML = "Seleziona una tua playlist"
        select.append(option)
        div.append(select)
        right.append(div)

        node.append(left)
        node.append(right)
        document.getElementById(idNode).append(node)
        printTopTrackArtist(info.artists[0].id)
    })
    .catch((e) => console.log(e))
}

/**
 * Funzione che restituisce il tempo in formato minuti:secondi dati dei millisecondi in input
 * @param {int} ms millisecondi 
 * @returns tempo in formato minuti:secondi
 */
function msToMinutesAndSeconds(ms) {
    var min = Math.floor(ms / 60000);
    var sec = ((ms % 60000) / 1000).toFixed(0);
    return min + ":" + (sec < 10 ? '0' : '') + sec;
}

function printTopTrackArtist(id){
    console.log(id)
}

/**
 * Funzione che verifica se un utente sia loggato o meno
 * @returns true SE l'utente è loggato nell'applicativo, false altrimenti
 */
function logged(){
    return localStorage.getItem("user") == null
}

/**
 * 
 * @returns 
 */
function printMyPlaylists(){
    if (logged()){return}
    document.write("QUI CI SONO LE MIE PLAYLIST")
}

/**
 * 
 * @returns 
 */
function printFollowedPlaylists(){
    if (logged()){return}
    document.write("QUI CI SONO LE PLAYLIST CHE SEGUO")
}

/**
 * Funzione che stampa la navbar nel nodo il cui id è passato come argomento
 * @param {*} id id del nodo in cui stampare la navbar 
 */
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
        node.href = "/src/login.html"
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

/**
 * Funziome che preleva l'email e la password da due input e fa una richiesta al db 
 * per verificare se mail e password corrispondo ad un utente 
 */
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

/**
 * Funzione che effettua il logout rimuovendo dal local storage le informazioni dell'utente
 */
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