const MY_BASE_URL = "http://127.0.0.1:3100/"
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
 * Funzione che effettua la chiamata all'API per effettuare il login
 * @param {*} user json contenente email e password
 * @returns SE le credenziali sono corrette, restituisce un json con i dati dell'utente
 *          ALTRIMENTI restituisce un errore nel formato json {text, status}
 */
async function userLogin(user){
    return fetch(MY_BASE_URL+"login?apikey=123456", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    }).then(res => {
        if(!res.ok){
            return {text: res.statusText, status: res.status}
        }else{
            return res.json()
        }
    })
}
/**
 * Funzione che effettua la chiamata all'API per ottenere le informazioni di un utente
 * @param {String} id id dell'utente di cui si richiedono le informazioni
 * @returns json contenente le informazioni
 */
async function getUser(id){
    return fetch(MY_BASE_URL+"users/"+id+"?apikey=123456", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API per aggiungere un nuovo utente
 * @param {*} user json contenente email, nickname e password
 * @returns json contenente l'id del nuovo utente oppure un errore nel formato json {text, status}
 */
async function postUser(user){
    return fetch(MY_BASE_URL+"users?apikey=123456", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    }).then(async res => {
        if (res.ok) {
            return res.json()
        } else {
            return {text: res.statusText, status: res.status}
        }
    })
}

/**
 * Funzione che effettua la chiamata all'API per modificare le informazioni di un utente
 * @param {String} id id dell'utente da modificare
 * @param {*} user informazioni da modificare
 * @returns 
 */
async function putUser(id, user){
    return fetch(MY_BASE_URL+"users/"+id+"?apikey=123456", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    }).then(async res => {
        if (res.ok) {
            return res.json()
        } else {
            return {text: res.statusText, status: res.status}
        }
    })
}

/**
 * Funzione che effettua la chiamata all'API che aggiunge una nuova playlist
 * @param {*} playlist json contenente la playlist da aggiungere
 */
async function postPlaylist(playlist) {
    return fetch(MY_BASE_URL+"playlist?apikey=123456", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(playlist)
    }).then(async response => {
        if (response.ok) {
            return response.json()
        } else {
            response.text().then( text => alert(text) )
        }
    })
}

/**
 * Funzione che effettua la chiamata all'API per cancellare una playlist
 * @param {*} id id della playlist da cancellare
 */
async function deletePlaylist(id) {
    return fetch(MY_BASE_URL+"playlist/"+id+"?apikey=123456", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(async response => {
        if (response.ok) {
            return response.json()
        } else {
            response.text().then( text => alert(text) )
        }
    })
}

/**
 * Funzione che effettua la chiamata all'API che restituisce le playlist di un utente
 * @param {*} id id dell'utente
 * @returns array di json delle sue playlist
 */
async function getMyPlaylist(id){
    return fetch(MY_BASE_URL+"playlists/"+id+"?apikey=123456", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API che restituisce le informazioni di una playlist
 * @param {*} id id della playlist di cui si richiedono le informazioni
 */
async function getPlaylist(id){
    return fetch(MY_BASE_URL+"playlists/info/"+id+"?apikey=123456", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * TO DO : NON VA
 * @returns 
 */
async function getPublicPlaylist(){
    console.log("inizio")
    return fetch(MY_BASE_URL+"playlists/public?apikey=123456", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API per aggiungere un nuovo follower alla playlist
 * @param {String} id id della playlist a cui si vuole aggiungere un nuovo follower
 * @param {*} newfollower json contenente id:iduser
 */
async function addFollow(id, newfollower){
    return fetch(MY_BASE_URL+"playlist/add/follow/"+id+"?apikey=123456", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newfollower)
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API per rimuovere un follower dalla playlist
 * @param {String} id id della playlist a cui si vuole rimuovere il follower
 * @param {*} oldfollower json contenente id:iduser
 * @returns 
 */
async function removeFollow(id, oldfollower){
    return fetch(MY_BASE_URL+"playlist/remove/follow/"+id+"?apikey=123456", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(oldfollower)
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API per ricercare una playlist pubblica dato il suo nome
 * @param {*} playlist nome della playlist
 * @returns Array di playlist SE ce ne sono con quel name
 */
async function searchPlaylist(playlist){
    return fetch(MY_BASE_URL+"playlists/search/"+playlist+"?apikey=123456", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API per aggiungere una track, 
 * congiuntamente alla sue informazioni, alla playlist
 * @returns 
 */
async function putPlaylist(){
    id = this.id
    info = await getTrack(id)
    track = {"id" : id, "info":info}
    playlist = this.parentNode.childNodes[0].value
    if(playlist=="Seleziona una tua playlist"){alert("Seleziona una tua playlist");return}
    console.log((track))

    result = await fetch(`${MY_BASE_URL}playlists/${playlist}?apikey=123456`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(track)
    })
    .then(async response => {
        if(response.status!=200){
            alert(response.statusText)
        }else{
            alert("Canzone aggiunta alla playlist")
            select = this.parentNode.childNodes[0]
            for(let i=0;i<select.childNodes.length;i++){
                if(select.childNodes[i].value==playlist){
                    select.childNodes[i].remove()
                    break
                }
            }
            return response.json()
        }
    })
    .catch((e) => {console.log(e)})
}
/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni su una track
 * @param {String} id id di Spotify della traccia
 * @returns json contenente le informazioni sulla track oppure un errore
 */
async function getTrack(id) {
    return fetch(`${BASE_URL}tracks/${id}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni su un album
 * @param {String} id id di Spotify dell'album
 * @returns json contenente le informazioni sull'album
 */
async function getAlbum(id) {
    return fetch(`${BASE_URL}albums/${id}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni sugli album dell'artista
 * @param {String} id id di Spotify dell'artista
 * @returns array di json contenente le informazioni sugli album
 */
async function getAlbumByArtist(id) {
    return fetch(`${BASE_URL}artists/${id}/albums`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni dell'artista
 * @param {String} id id di Spotify dell'artista 
 * @returns json contenente le informazioni dell'artista
 */
async function getArtist(id) {
    return fetch(`${BASE_URL}artists/${id}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le 50 track piu ascoltate in Italia
 */
async function getTopCharts(){
    return fetch(`${BASE_URL}search?type=playlist&q=${'Top 50 - Italy'}&limit=1`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then((response) => response.json())
    .then(async searchResults => {
        return await getPlaylistSpotify(searchResults.playlists.items[0].tracks.href)}
    ).catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni sulle top track di un artista (max 10)
 * @param {String} id id di Spotify dell'artista
 * @returns array di json contente le informazioni sulle track
 */
async function getTopTracks(id) {
    return fetch(`${BASE_URL}artists/${id}/top-tracks?market=ES`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni sulla playlist di Spotify
 * @param {*} url url di una playlist di Spotify 
 * @returns informazioni sulla playlist
 */
async function getPlaylistSpotify(url){
    return fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che ricerca le canzoni in base al nome della track data
 * @param {String} track nome della track da ricercare
 * @returns array di json contenenti le track risultanti
 */
async function searchTrack(track){
    return fetch(`${BASE_URL}search?q=${track}&type=track`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che ricerca gli album in base al nome dell'album dato
 * @param {String} album nome dell'album da ricercare
 * @returns array di json contenenti gli album risultanti
 */
async function searchAlbum(album){
    return fetch(`${BASE_URL}search?q=${album}&type=album`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che ricerca gli artist in base al nome dell'artist dato
 * @param {String} artist nome dell'artist da ricercare
 * @returns array di json contenenti gli artist risultanti
 */
async function searchArtist(artist){
    return fetch(`${BASE_URL}search?q=${artist}&type=artist`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che verifica se un utente sia loggato o meno
 * @returns true SE l'utente è loggato nell'applicativo, false altrimenti
 */
function logged(){
    return localStorage.getItem("user") != null
}

async function loadAccount(){
    user = await getUser(window.localStorage.getItem("user"))
    user = user[0]
    document.getElementById("email").value = user.email
    document.getElementById("nickname").value = user.nickname
}

async function cambiaCredenziali(){
    check = document.getElementById("changePassword")
    if(check.checked){
        newpass = document.getElementById("password").value
        if(newpass==""){return}
        updatedUser = {
            email : document.getElementById("email").value,
            nickname : document.getElementById("nickname").value,
            password : newpass
        }
    }else{
        updatedUser = {
            email : document.getElementById("email").value,
            nickname : document.getElementById("nickname").value
        }
    }
    result = await putUser(window.localStorage.getItem("user"), updatedUser)
    console.log(result)
}

/**
 * Funzione che stampa le track migliori in Italia
 */
async function printTopCharts() {
    playlist = await getTopCharts()
    playlist=playlist.items
    for(let i=0;i<playlist.length;i++){
        playlist[i]=playlist[i].track
    }
    printPlaylist(playlist, "top", "top-template")
}

/**
 * Funzione che stampa le tracks contenente nella playlist, visualizzate con il titolo, immagine della canzone e nome dell'artista
 * @param {Array} playlist Array contenente le track da stampare
 * @param {String} idNode id del node in cui stampare le track
 * @param {String} idTemplate id del node che verrà utilizzato come template per le track
 */
function printPlaylist(playlist, idNode, idTemplate){
    template = document.getElementById(idTemplate).cloneNode(true)
    template.classList.remove("visually-hidden")
    document.getElementById(idNode).innerHTML=""
    console.log(playlist)
    // button template to clone
    button = document.createElement("button")
    button.innerHTML="Show more"
    button.classList.add("show", "btn","btn-secondary")
    
    for (let i=0; i<playlist.length; i+=5){
        // create the button to show more element
        newButton = button.cloneNode(true)
        newButton.id = "showMore_" + i/5
        newButton.addEventListener("click", showMore)
        //create the row
        row = document.createElement("div")
        row.classList.add("row", "justify-content-center")
        newid = idNode+"Row" + (i/5)
        row.id= newid
        document.getElementById(idNode).append(row)
        printTracksCard(playlist.slice(i,i+5), template, newid, i+1)
        // append the button and hide everything
        document.getElementById(newid).append(newButton)
        document.getElementById(newid).classList.add("visually-hidden")
    }
    document.getElementById(idNode+"Row0").classList.remove("visually-hidden")
    if (playlist.length%5==0){
        document.getElementById("showMore_" + ((playlist.length/5)-1)).remove()
    }

    //document.getElementById(idNode+'-template').remove()
}

/**
 * Funzione che scrive le track della playlist mediante card 
 * @param {Array} playlist array contenente le track
 * @param {Node} template node di base della card da cui clono
 * @param {String} id id del node a cui accodare le varie card
 * @param {int} startCount count da cui far partire il conteggio delle card
 */
function printTracksCard(playlist, template, id, startCount){
    for (let i=0; i<playlist.length; i++){
        clone = template.cloneNode(true)
        //clone.classList.add("link")
        clone.getElementsByClassName("card-img")[0].addEventListener("click", function move(){window.location.href = "/src/track.html?" + playlist[i].id})
        clone.id=id + (i + startCount)
        clone.getElementsByClassName("card-img")[0].classList.add("link")
        clone.getElementsByClassName("card-img")[0].src = playlist[i].album.images[0].url
        clone.getElementsByClassName("nome_traccia")[0].innerHTML = "#" + (i+startCount) + " " +playlist[i].name
        clone.getElementsByClassName("nome_artista")[0].innerHTML = playlist[i].artists[0].name
        //clone.getElementsByClassName("nome_artista")[0].addEventListener("click", function move(){window.location.href = "/src/track.html?" + playlist[i].artists[0].id})
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

/**
 * Funzione che stampa le informazioni di una track nel nodo specificato 
 * e stampa le canzoni migliori dell'artista nel node con id 'topTrackArtist'
 * @param {String} idTrack id della track di cui richiedo le informazioni
 * @param {String} idNode id del nodo a cui accodare le informazioni da stampare
 * @param {String} idTemplate id del nodo che verrà utilizzato come template per le track
 */
async function printTrackInfo(idTrack, idNode, idTemplate){
    info = await getTrack(idTrack)
    if(info.error){
        alert(info.error.message)
        return
    }
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
    img.src = info.album.images[0].url
    left.append(img)

    div = document.createElement("li")
    div.classList.add("list-group-item", "list-group-item-dark")
    div.innerHTML="Artisti: "
    for (let i=0; i<info.artists.length; i++){
        a = document.createElement("a")
        a.addEventListener("click", function show(){window.location.href="/src/artist.html?"+info.artists[i].id})
        a.innerHTML = info.artists[i].name 
        div.append(a)
        i+1<info.artists.length ? div.append(document.createElement("div").innerHTML=" e ") : null
    }
    right.append(div)

    div = document.createElement("li")
    div.classList.add("list-group-item", "list-group-item-dark")
    div.innerHTML = "Album: "
    a = document.createElement("a")
    a.innerHTML = info.album.name
    a.addEventListener("click", function move(){window.location.href="/src/album.html?"+info.album.id})
    a.classList.add("link")
    div.append(a)
    right.append(div)

    div = document.createElement("li")
    div.classList.add("list-group-item", "list-group-item-dark")
    div.innerHTML = "Durata: " + msToMinutesAndSeconds(info.duration_ms)
    right.append(div)

    if (info.preview_url!=null){
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
    }
    if (logged()){
        li = document.createElement("li")
        li.classList.add("list-group-item", "list-group-item-dark")
        
        div = document.createElement("div")
        div.innerHTML = "Aggiungi alla playlist: "
        li.append(div)
        div = document.createElement("div")
        select = document.createElement("select")
        select.id = "myplaylist"
        select.classList.add("form-select")
        select.style = "width:50%"
        option = document.createElement("option")
        option.innerHTML = "Seleziona una tua playlist"
        select.append(option)
        myplaylist = await getMyPlaylist(window.localStorage.getItem("user"))
        console.log(myplaylist)
        for (let i=0;i<myplaylist.length;i++){
            option = document.createElement("option")
            option.innerHTML = myplaylist[i].name
            option.value = myplaylist[i]._id
            option.classList.add("playlistToAdd")
            select.append(option)
        }
        
        div.append(select)
        li.append(div)
        button = document.createElement("button")
        button.innerHTML="Aggiungi"
        button.id = window.location.href.split("?")[1]
        button.addEventListener("click", putPlaylist)
        button.classList.add("btn", "btn-primary", "btn-light")
        div.append(button)
        right.append(li)
    }

    node.append(left)
    node.append(right)
    document.getElementById(idNode).append(node)

    printTopTrackArtist(info.artists[0].id, idTemplate)
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

/**
 * Funzione che stampa le canzoni migliori di un'artista nel node con id 'topTrackArtist'
 * @param {String} idArtist id dell'artista di cui richiediamo informazioni
 * @param {String} idTemplate id del nodo che verrà utilizzato come template per le track
 */
async function printTopTrackArtist(idArtist, idTemplate){
    playlist = await getTopTracks(idArtist)
    if(playlist.error){
        alert(playlist.error.message)
        return
    }
    console.log(playlist)
    printPlaylist(playlist.tracks, "topTrackArtist", idTemplate)
    nomeArtista = document.createElement("h4")
    nomeArtista.innerHTML = "Top track e feat di "+playlist.tracks[0].artists[0].name
    document.getElementById("topTrackArtist").prepend(nomeArtista)
}

/**
 * Funzione che stampa le informazioni di un'artista congiuntamente alle sue track migliori ed ai suoi album,
 * rispettivamente in un node con id 'topTrackArtist' e in un node con id 'artistAlbum'
 * @param {String} idArtist id dell'artista di cui richiediamo informazioni
 * @param {String} idNode id del nodo a cui si vogliono accodare le informazioni
 */
async function printArtistInfo(idArtist, idNode){
    artist = await getArtist(idArtist)
    if(artist.error){
        alert(artist.error.message)
        return
    }
    console.log(artist)
    node = document.createElement("div")
    node.classList.add("row", "justify-content-center")
    // titolo
    title = document.createElement("h3")
    title.innerHTML = "Artista: " + artist.name
    node.append(title)
    // divisione in due sezioni della pagina, a sinistra la foto dell'artista e a destra le informazioni
    left = document.createElement("div")
    left.classList.add("col-4", "col-sm-12", "col-md-4",)
    img = document.createElement("img")
    img.style="width:100%"
    img.src = artist.images[0].url
    left.append(img)
    right = document.createElement("ul")
    right.classList.add("col-8","col-sm-12", "col-md-7", "list-group","list-group-flush")

    li = document.createElement("li")
    li.classList.add("list-group-item", "list-group-item-dark")
    li_clone = li.cloneNode(true)
    if(artist.genres.length==0){
        li_clone.innerHTML="Generi: Nessuno"
    }else{
        li_clone.innerHTML="Generi: " + artist.genres[0]
        for (let i=1; i<artist.genres.length; i++){
            li_clone.innerHTML += ", " + artist.genres[i] 
        }
    }
    right.append(li_clone)

    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Follower: "
    a = document.createElement("a")
    a.innerHTML = artist.followers.total.toLocaleString('en-US')
    li_clone.append(a)
    right.append(li_clone)

    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Aggiungi ai preferiti: "
    button = document.createElement("button")
    button.innerHTML="Aggiungi"
    li_clone.append(button)
    right.append(li_clone)

    node.append(left)
    node.append(right)
    document.getElementById(idNode).append(node)
}

/**
 * Funzione che stampa le informazioni degli artisti nel nodo specificato utilizzando il template
 * @param {*} artists array di artisti
 * @param {*} idNode id del nodo a cui si vogliono accodare gli artisti
 * @param {*} idTemplate id del nodo da cui si clona il template da utilizzare
 */
function printArtists(artists, idNode, idTemplate){
    document.getElementById(idNode).innerHTML=""
    template = document.getElementById(idTemplate).cloneNode(true)
    template.classList.remove("visually-hidden")
    row = document.createElement("div")
    row.id=idNode+"Row0"
    row.classList.add("row", "justify-content-center")
    for (let i=0; i<artists.length; i++){
        clone = template.cloneNode(true)

        clone.getElementsByClassName("card-img")[0].addEventListener("click", function move(){window.location.href = "/src/artist.html?" + artists[i].id})
        clone.getElementsByClassName("card-img")[0].classList.add("link")
        if(artists[i].images.length!=0){
            clone.getElementsByClassName("card-img")[0].src = artists[i].images[0].url
        }else{
            clone.getElementsByClassName("card-img")[0].src = "/img/music.jpg"
        }
        clone.getElementsByClassName("nome_artista")[0].innerHTML = "#" + (i+1) + " " +artists[i].name
        clone.getElementsByClassName("follower")[0].innerHTML = artists[i].followers.total.toLocaleString('en-US')
        row.append(clone)
        if(((i+1)%5==0)&&(i!=0)){
            if(i+1!=artists.length){
                // create the button to show more element
                newButton = document.createElement("button")
                newButton.id = "showMore_" + i
                newButton.classList.add("show", "btn","btn-secondary")
                newButton.addEventListener("click", showMore)
                newButton.innerHTML= "Show more"
                row.append(newButton)
            }
            document.getElementById(idNode).append(row)
            //create the row
            row = document.createElement("div")
            row.classList.add("row", "justify-content-center", "visually-hidden")
            newid = idNode+"Row" + (i/5)
            row.id= newid
        }else if(i+1==artists.length){
            document.getElementById(idNode).append(row)
            //create the row
            row = document.createElement("div")
            row.classList.add("row", "justify-content-center", "visually-hidden")
            newid = idNode+"Row" + (i/5)
            row.id= newid
        }
    }
}

/**
 * Funzione che stampa gli album dell'artista in un node con id 'artistAlbum'
 * @param {String} idArtist id dell'artista di cui si richiedono gli album
 */
async function printAlbumArtist(idArtist){
    album = await getAlbumByArtist(idArtist)
    if(album.error){
        alert(album.error.message)
        return
    }
    album = album.items
    // considero solo gli album dell'artista e NON ep o partecipazioni ad altri album
    onlyalbum = []
    for (let i=0;i<album.length;i++){
        if (album[i].album_group=="album"){
            onlyalbum.push(album[i])
        }
    }
    console.log(onlyalbum)
    if(onlyalbum.length==0){return}

    printAlbum(onlyalbum, "album", "album-template")
    h4 = document.createElement("h4")
    h4.innerHTML = "Discografia di " + onlyalbum[0].artists[0].name
    document.getElementById("album").prepend(h4)
}

/**
 * Funzione che stampa nel nodo specificato gli album
 * @param {*} albums array di album
 * @param {String} idNode id del nodo a cui si vogliono accodare gli album
 * @param {String} idTemplate id del nodo da cui si clona il template da utilizzare
 */
function printAlbum(albums, idNode, idTemplate){
    template = document.getElementById(idTemplate).cloneNode(true)
    document.getElementById(idNode).innerHTML=""
    template.classList.remove("visually-hidden")
    row = document.createElement("div")
    row.id=idNode+"Row0"
    row.classList.add("row", "justify-content-center")
    for (let i=0; i<albums.length; i++){
        clone = template.cloneNode(true)

        clone.getElementsByClassName("card-img")[0].addEventListener("click", function move(){window.location.href = "/src/album.html?" + albums[i].id})
        clone.getElementsByClassName("card-img")[0].src = albums[i].images[0].url
        clone.getElementsByClassName("card-img")[0].classList.add("link")
        clone.getElementsByClassName("nome_album")[0].innerHTML = "#" + (i+1) + " " +albums[i].name
        clone.getElementsByClassName("nome_artista")[0].innerHTML = albums[i].artists[0].name
        row.append(clone)
        if(((i+1)%5==0)&&(i!=0)){
            if(i+1!=albums.length){
                // create the button to show more element
                newButton = document.createElement("button")
                newButton.id = "showMore_" + i
                newButton.classList.add("show", "btn","btn-secondary")
                newButton.addEventListener("click", showMore)
                newButton.innerHTML= "Show more"
                row.append(newButton)
            }
            document.getElementById(idNode).append(row)
            //create the row
            row = document.createElement("div")
            row.classList.add("row", "justify-content-center", "visually-hidden")
            newid = idNode+"Row" + (i/5)
            row.id= newid
        }else if(i+1==albums.length){
            document.getElementById(idNode).append(row)
            //create the row
            row = document.createElement("div")
            row.classList.add("row", "justify-content-center", "visually-hidden")
            newid = idNode+"Row" + (i/5)
            row.id= newid
        }
    }
}

/**
 * Funzione che stampa le informazioni dell'album nel nodo con id specificato,
 * congiuntamente con la lista delle track accodate nel nodo con id 'albumTrack'
 * @param {String} idAlbum id dell'album di cui si cercano le informazioni
 * @param {String} idNode id del nodo in cui accodare le informazioni
 */
async function printAlbumInfo(idAlbum, idNode){
    album = await getAlbum(idAlbum)
    if(album.error){
        alert(album.error.message)
        return
    }
    console.log(album)
    // titolo
    node = document.createElement("div")
    node.classList.add("row", "justify-content-center")
    title = document.createElement("h3")
    title.innerHTML = "Album: " + album.name
    node.append(title)
    // divisione in due sezioni della pagina, a sinistra la foto dell'album e a destra le informazioni
    left = document.createElement("div")
    left.classList.add("col-4", "col-sm-12", "col-md-4",)
    img = document.createElement("img")
    img.style="width:100%"
    img.src = album.images[0].url
    left.append(img)
    right = document.createElement("ul")
    right.classList.add("col-8","col-sm-12", "col-md-7", "list-group","list-group-flush")

    li = document.createElement("li")
    li.classList.add("list-group-item", "list-group-item-dark")
    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Autori: "  
    a = document.createElement("a")
    a.innerHTML = album.artists[0].name
    a.addEventListener("click", function move(){window.location.href="/src/artist.html?"+album.artists[0].id})
    a.classList.add("link")
    li_clone.append(a)
    right.append(li_clone)

    li_clone = li.cloneNode(true)
    if(album.genres.length==0){
        li_clone.innerHTML="Generi: Nessuno"
    }else{
        li_clone.innerHTML="Generi: " + album.genres[0]
        for (let i=1; i<album.genres.length; i++){
            li_clone.innerHTML += ", " + album.genres[i] 
        }
    }
    right.append(li_clone)

    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Numero di traccie: " + album.total_tracks
    right.append(li_clone)

    li_clone = li.cloneNode(true)
    date = new Date(album.release_date)
    li_clone.innerHTML = "Data di uscita: " + date.toLocaleDateString('it-IT')
    right.append(li_clone)

    node.append(left)
    node.append(right)
    document.getElementById(idNode).append(node)

    printAlbumTrack(album.tracks.items)
}

/**
 * Funzione che stampa le track di un album accodandole al nodo con id 'albumTrack'
 * @param {Array} tracks array contenente le track dell'album
 */
async function printAlbumTrack(tracks){
    console.log(tracks)
    tracklist = document.createElement("ul")
    tracklist.classList.add("container", "list-group", "list-group-flush")
    // creo il template degli elementi della lista
    template = document.createElement("li")
    template.classList.add("list-group-item", "list-group-item-dark")
    row = document.createElement("div")
    row.classList.add("row")
    col = document.createElement("div")
    col.classList.add("col")
    row.append(col, col.cloneNode(true))
    template.append(row, row.cloneNode(true))

    if(logged()){myplaylist = await getMyPlaylist(window.localStorage.getItem("user"))}

    for(let i=0;i<tracks.length;i++){
        clone = template.cloneNode(true)
        clone.childNodes[0].childNodes[0].innerHTML = "#" + (i+1) + " "
            a = document.createElement("a")
            a.innerHTML = tracks[i].name
            a.addEventListener("click", function move(){window.location.href = "/src/track.html?" + tracks[i].id})
            a.classList.add("link")
            clone.childNodes[0].childNodes[0].append(a)
        if(tracks[i].preview_url!=null){
            // la preview per alcuna track non è disponibile
            audio = document.createElement("audio")
            audio.style = "width:100%"
            audio.controls="controls"
            source = document.createElement("source")
            source.src = tracks[i].preview_url
            source.type = "audio/mpeg"
            audio.append(source)
            clone.childNodes[0].childNodes[1].append(audio)
        }
        if(logged()){
            // la possibilità di aggiungere la track ad una playlist è possibile solo SE si è loggati
            clone.childNodes[1].childNodes[0].innerHTML = "Aggiungi in una tua playlist"
            select = document.createElement("select")
            select.classList.add("form-select")
            select.id="myplaylist"
            option = document.createElement("option")
            option.innerHTML = "Seleziona una tua playlist"
            select.append(option)
                for (let i=0;i<myplaylist.length;i++){
                    option = document.createElement("option")
                    option.innerHTML = myplaylist[i].name
                    option.value = myplaylist[i]._id
                    option.classList.add("playlistToAdd")
                    select.append(option)
                }
            clone.childNodes[1].childNodes[1].append(select)
            clone.childNodes[1].childNodes[1].classList.add("text-center")
            button = document.createElement("button")
            button.id=tracks[i].id
            button.innerHTML="Aggiungi"
            button.addEventListener("click", putPlaylist)
            button.style = "width:80%;margin: 5px 0;"
            button.classList.add("btn", "btn-primary", "btn-light")
            clone.childNodes[1].childNodes[1].append(button)
        }
        tracklist.append(clone)
    }

    title = document.createElement("h4")
    title.innerHTML = "Tracklist dell'album"
    document.getElementById("albumTrack").append(tracklist)
    document.getElementById("albumTrack").prepend(title)
    document.getElementById("albumPlaceholder").remove()
}

/**
 * Funzione che stampa le playlist dell'utente
 * @param {String} idNode id dove accodare le playlist 
 * @param {String} idTemplate id dove reperire il template da utilizzare
 */
async function printMyPlaylists(idNode, idTemplate){
    if (!logged()){return}
    user = localStorage.getItem("user")
    playlists = await getMyPlaylist(user)
    console.log(playlists)
    node = document.getElementById(idNode)
    if (playlists.length==0){
        title = document.createElement("h4")
        title.innerHTML = "Non hai ancora nessuna playlist, creane una "
        a = document.createElement("a")
        a.href = "/src/newplaylist.html"
        a.innerHTML = "qui"
        title.append(a)
        node.append(title)
    }else{
        printPlaylistCard(playlists, idNode, idTemplate)
        title = document.createElement("h4")
        title.innerHTML = "Le tue playlist"
        node.parentNode.prepend(title)
    }
}

/**
 * Funzione che stampa le playlist 5 playlist per riga
 * @param {*} playlists array contenente le playlist
 * @param {String} idNode id dove accodare le playlist 
 * @param {String} idTemplate id dove reperire il template da utilizzare
 */
function printPlaylistCard(playlists, idNode, idTemplate){
    node = document.getElementById(idNode)
    node.innerHTML=""
    template = document.getElementById(idTemplate).cloneNode(true)
    template.classList.remove("visually-hidden")
    //document.getElementById(idTemplate).remove()
    row = document.createElement("div")
    row.classList.add("row", "justify-content-center")
    node.append(row)
    node = row
    for(let i=0;i<playlists.length;i++){
        div = template.cloneNode(true)
        if(playlists[i].tracks && playlists[i].tracks.length!=0){
            if (playlists[i].tracks[0].info.album.images[0].url){
                div.getElementsByClassName("card-img")[0].src = playlists[i].tracks[0].info.album.images[0].url
            }
        }
        div.getElementsByClassName("card-img")[0].addEventListener("click", function move(){window.location.href = "/src/infoplaylist.html?"+playlists[i]._id})
        div.getElementsByClassName("nome_playlist")[0].innerHTML = playlists[i].name
        if(logged() && playlists[i].owner==window.localStorage.getItem("user")){
            del = document.createElement("div")
            del.classList.add("card-action", "link")
            del.innerHTML = "\u274C"
            del.addEventListener("click", async function (){await deletePlaylist(playlists[i]._id);})
            div.getElementsByClassName("nome_playlist")[0].append(del)
        }else{
            found=false
            for(let k=0;k<playlists[i].followers.length;k++){
                if(window.localStorage.getItem("user") == playlists[i].followers[k].id){
                    del = document.createElement("div")
                    del.classList.add("card-action", "link")
                    del.innerHTML = "\u274C"
                    del.addEventListener("click", async function (){
                        await removeFollow(playlists[i]._id, {"id" : window.localStorage.getItem("user")});
                        this.innerHTML = "Follow rimosso"
                    })
                    div.getElementsByClassName("nome_playlist")[0].append(del)
                    found = true
                    break
                }
            }
            if(!found){
                del = document.createElement("div")
                del.classList.add("card-action", "link")
                del.innerHTML = "➕"
                del.addEventListener("click", async function (){
                    await addFollow(playlists[i]._id, {"id" : window.localStorage.getItem("user")});
                    this.innerHTML = "Follow aggiunto"
                })
                div.getElementsByClassName("nome_playlist")[0].append(del)
            }
        }
        node.append(div)
    }
}

/**
 * Funzione che stampa le informazioni di una playlist e le sue track
 * @param {String} id 
 * @param {String} idNode 
 * @param {*} template 
 */
async function printPlaylistInfo(id, idNode, template){
    playlist = await getPlaylist(id)
    if(playlist[0]==undefined){window.location.href = "/src/playlist.html";return;}
    playlist = playlist[0]
    console.log(playlist)

    // titolo
    node = document.createElement("div")
    node.classList.add("row", "justify-content-center")
    title = document.createElement("h3")
    title.innerHTML = "Playlist: " + playlist.name
    node.append(title)
    // divisione in due sezioni della pagina, a sinistra la foto della playlist e a destra le informazioni
    left = document.createElement("div")
    left.classList.add("col-4", "col-sm-12", "col-md-4",)
    img = document.createElement("img")
    img.style="width:100%"
    if(playlist.tracks && playlist.tracks.length!=0){
        img.src = playlist.tracks[0].info.album.images[0].url
    }else{
        img.src = "../img/music.jpg"
    }

    left.append(img)
    right = document.createElement("ul")
    right.classList.add("col-8","col-sm-12", "col-md-7", "list-group","list-group-flush")

    li = document.createElement("li")
    li.classList.add("list-group-item", "list-group-item-dark")

    li_clone = li.cloneNode(true)
    if(playlist.owner = window.localStorage.getItem("user")){
        autore="Tu"
    }else{
        autore = await getUser(playlist.owner)
        autore = autore.nickname
    }
    li_clone.innerHTML = "Autore: "  + autore
    right.append(li_clone)

    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Descrizione: " + (!playlist.description || playlist.description=="" ? "nessuna" : playlist.description)
    right.append(li_clone)

    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Tag:"
    if(playlist.tags.length==0){
        li_clone.innerHTML+=" Nessuno"
    }else{
        for(let i=0;i<playlist.tags.length;i++){
            a = document.createElement("a")
            a.innerHTML = " #" + playlist.tags[i]
            li_clone.append(a)
        }
    }
    right.append(li_clone)

    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Pubblica: " + (playlist.public ? "si" : "no")
    right.append(li_clone)

    
    node.append(left)
    node.append(right)
    document.getElementById(idNode).append(node)

    printPlaylistTracks(playlist.tracks, "trackPlaylist")
}

/**
 * Funzione che stampa le tracks nel nodo specificato
 * @param {*} tracks array di canzoni da stampare
 * @param {String} idNode id del nodo a cui accodare le canzoni della playlist
 */
async function printPlaylistTracks(tracks, idNode){
    node = document.getElementById(idNode)
    node.innerHTML = ""
    title = document.createElement("h4")
    if(tracks.length==0){
        title.innerHTML = "Nessuna canzone nella playlist"
        node.append(title)
    }else{
        
        tracklist = document.createElement("ul")
    tracklist.classList.add("container", "list-group", "list-group-flush")
    // creo il template degli elementi della lista
    template = document.createElement("li")
    template.classList.add("list-group-item", "list-group-item-dark")
    row = document.createElement("div")
    row.classList.add("row")
    col = document.createElement("div")
    col.classList.add("col")
    row.append(col, col.cloneNode(true))
    template.append(row, row.cloneNode(true))

    if(logged()){myplaylist = await getMyPlaylist(window.localStorage.getItem("user"))}

    for(let i=0;i<tracks.length;i++){
        clone = template.cloneNode(true)
        clone.childNodes[0].childNodes[0].innerHTML = "#" + (i+1) + " "
            a = document.createElement("a")
            a.innerHTML = tracks[i].info.name
            a.addEventListener("click", function move(){window.location.href = "/src/track.html?" + tracks[i].info.id})
            a.classList.add("link")
            clone.childNodes[0].childNodes[0].append(a)
        if(tracks[i].info.preview_url!=null){
            // la preview per alcuna track non è disponibile
            audio = document.createElement("audio")
            audio.style = "width:100%"
            audio.controls="controls"
            source = document.createElement("source")
            source.src = tracks[i].info.preview_url
            source.type = "audio/mpeg"
            audio.append(source)
            clone.childNodes[0].childNodes[1].append(audio)
        }
        if(logged()){
            // la possibilità di aggiungere la track ad una playlist è possibile solo SE si è loggati
            clone.childNodes[1].childNodes[0].innerHTML = "Aggiungi in una tua playlist"
            clone.childNodes[1].childNodes[1].classList.add("text-center")
            select = document.createElement("select")
            select.classList.add("form-select")
            select.id="myplaylist"
            option = document.createElement("option")
            option.innerHTML = "Seleziona una tua playlist"
            select.append(option)
            for (let i=0;i<myplaylist.length;i++){
                if(myplaylist[i]._id!=window.location.href.split("?")[1]){
                    option = document.createElement("option")
                    option.innerHTML = myplaylist[i].name
                    option.value = myplaylist[i]._id
                    option.classList.add("playlistToAdd")
                    select.append(option)
                }
            }
            clone.childNodes[1].childNodes[1].append(select)
            button = document.createElement("button")
            button.id=tracks[i].info.id
            button.innerHTML="Aggiungi"
            button.style = "width:80%;margin:5px 0;"
            button.addEventListener("click", putPlaylist)
            button.classList.add("btn", "btn-primary", "btn-light")
            clone.childNodes[1].childNodes[1].append(button)
        }
        tracklist.append(clone)
    }

    title = document.createElement("h4")
    title.innerHTML = "Tracklist della playlist"
    document.getElementById(idNode).append(tracklist)
    document.getElementById(idNode).prepend(title)
    }
}

/**
 * TO DO
 * @returns 
 */
function printFollowedPlaylists(){
    if (!logged()){return}
    document.write("QUI CI SONO LE PLAYLIST CHE SEGUO")
}

/**
 * TO DO NON VA
 */
async function printPublicPlaylists(){
    playlists = await getPublicPlaylist()
    console.log(playlists)
    printPlaylistCard(playlists, "publicPlaylists", "playlist-template")
    title = document.createElement("h4")
    title.innerHTML = "Esplora le playlist pubbliche"
    document.getElementById("publicPlaylists").prepend(title)
}

/**
 * Funzione che stampa la navbar nel nodo il cui id è passato come argomento
 * @param {String} id id del nodo in cui stampare la navbar 
 */
async function printNavBar(id){
    navdiv = document.createElement("div")
    titlenav = document.createElement("h3")
    titlenav.innerHTML = "Menu"
    navdiv.appendChild(titlenav)
    if (!logged()){
        anav = document.createElement("a")
        anav.classList.add("nav","nav-link")
        anav.innerHTML="Home"
        anav.href="/"
        navdiv.appendChild(anav)

        sub = document.createElement("h5")
        sub.innerHTML = "Per accedere alle funzionalità complete, effettua il login o registrati"
        navdiv.append(sub)

        anav = document.createElement("a")
        anav.innerHTML = "Accedi o registrati"
        anav.href = "/src/login.html"
        navdiv.append(anav)
    }else{
        titlenav = document.createElement("h4")
        nickname = (window.localStorage.getItem("nickname"))
        if(nickname){
            titlenav.innerHTML = "Benvenuto " + nickname
        }
        
        navdiv.append(titlenav)
        nav = document.createElement("nav")
        nav.classList.add("nav", "flex-column")
        anav = document.createElement("a")
        anav.classList.add("nav-link")
        anav.innerHTML="Home"
        anav.href="/"
        nav.appendChild(anav)

        anav = document.createElement("a")
        anav.classList.add("nav-link")
        anav.innerHTML="Crea una playlist"
        anav.href="/src/newplaylist.html"
        nav.appendChild(anav)

        anav = document.createElement("a")
        anav.classList.add("nav-link")
        anav.innerHTML="Gestisci le tue playlist"
        anav.href="/src/playlist.html"
        nav.appendChild(anav)

        anav = document.createElement("a")
        anav.classList.add("nav-link")
        anav.innerHTML="Gestisci il tuo account"
        anav.href="/src/account.html"
        nav.appendChild(anav)

        anav = document.createElement("a")
        anav.classList.add("nav-link")
        anav.innerHTML="Logout"
        anav.addEventListener("click", logout)
        anav.href=window.location.href
        nav.appendChild(anav)

        navdiv.append(nav)
    }
    document.getElementById(id).append(navdiv)
}

/**
 * Funzione che, dati i valori contenuti in due input text con id email e password, crea un nuovo utente nel db
 * SE si verificano degli errori, li stampa in un alert 
 */
async function addUser(){
    email = document.getElementById("email").value
    password = document.getElementById("password").value
    nickname = document.getElementById("user").value
    var user = {
        email: email,
        password: password,
        nickname: nickname
    }
    console.log(user)
    res = await postUser(user)
    console.log(res)
    if (!res.status){
        localStorage.setItem("user", res.insertedId)
        div = document.getElementById("userForm")
        div.innerHTML = ""

        mess = document.createElement("h4")
        mess.classList.add("text-center")
        mess.innerHTML = "Utente creato correttamente, benvenuto!</br>"
        a = document.createElement("a")
        a.innerHTML = "Torna alla home"
        a.href="/"
        mess.append(a)
        div.append(mess)
    }else{
        alert(res.status + res.text)
    }
}

/**
 * Funziome che preleva l'email e la password da due input e fa una richiesta al db 
 * per verificare se mail e password corrispondo ad un utente 
 */
async function login(){
    email = document.getElementById("login_email").value
    password = document.getElementById("login_password").value
    var user = {
        email: email,
        password: password
    }
    response = await userLogin(user)
    console.log(response)
    if (!response.status) {
        localStorage.setItem("user", response.loggedUser._id)
        localStorage.setItem("nickname", response.loggedUser.nickname)
        window.location.href = document.referrer
    } else {
        alert(response.text)
    }
    
}

/**
 * Funzione che effettua il logout rimuovendo dal local storage le informazioni dell'utente
 */
function logout(){
    localStorage.removeItem("user")
    localStorage.removeItem("nickname")
}

/**
 * Funzione che crea una nuova playlist 
 */
async function addPlaylist(){
    nome = document.getElementById("nome").value
    owner = window.localStorage.getItem("user")
    public = document.getElementById("public").checked
    description = document.getElementById("descrizione").value
    tracks = []
    tags = []
    followers = []
    tagsNode = document.getElementsByClassName("tagSpan")
    if(tags){
        find=false
        Array.prototype.forEach.call(tagsNode, function(tag) {
            tags.push(tag.innerHTML)
        });
        if(find){return}
    }
    var playlist = {
        name: nome,
        owner: owner,
        tracks: tracks,
        public: public,
        description: description,
        tags: tags,
        followers: followers
    }
    res = await postPlaylist(playlist)
    console.log(res)
    window.location.href = "/src/infoplaylist.html?"+res.insertedId
}

/**
 * Funzione che aggiunge un nuovo tag presente nell'input con id "tagInput" SE non è già presente
 */
function addTag(){
    tag = document.getElementById("tagInput").value
    document.getElementById("tagInput").value=""
    if (tag!=""){
        tags = document.getElementsByClassName("tagSpan")
        if(tags){
            find=false
            Array.prototype.forEach.call(tags, function(el) {
                if(el.innerHTML==tag){
                    find=true
                    return
                }
            });
            if(find){return}
        }
        newtag = document.createElement("div")
        newtag.classList.add("col", "tag")
        a = document.createElement("a")
        a.innerHTML = "\u274C "
        a.classList.add("link")
        a.addEventListener("click", removeTag)
        div = document.createElement("div")
        span = document.createElement("span")
        span.classList.add("tagSpan")
        span.innerHTML=tag
        newtag.append(span)
        newtag.prepend(a)
        list = document.getElementById("tagList")
        nessuno = document.getElementById("nessuno")
        if (nessuno){nessuno.remove()}
        list.append(newtag)
    }
}

/**
 * Funzione che rimuove il tag selezionato e, nel caso fosse l'ultimo, aggiunge il messaggio "Nessuno"
 */
function removeTag(){
    this.parentNode.remove()
    if (document.getElementsByClassName("tag").length==0){
        div = document.createElement("div")
        div.classList.add("col-3")
        div.innerHTML="Nessuno"
        div.id="nessuno"
        list.append(div)
    }
}

/**
 * Funzione che, dato il valore presente nell'input e lo stato dei 4 switch, fa una ricerca 
 * in base all'input per ogni categoria selezionata
 */
async function search(){
    input = document.getElementById("input").value
    if(input==""){return}
    radioTrack = document.getElementById("track")
    radioArtist = document.getElementById("artist")
    radioAlbum = document.getElementById("album")
    radioPlaylist = document.getElementById("playlist")
    if(!(radioTrack.checked || radioArtist.checked || radioAlbum.checked || radioPlaylist.checked)){return}

    prevSearch = document.getElementById("searchResult")
    if(prevSearch){prevSearch.remove()}
    divSearch = document.createElement("div")
    divSearch.id="searchResult"
    title = document.createElement("h4")
    title.innerHTML = "Risultati ricerca"
    divSearch.append(title)
    document.getElementById("myPlaylists").parentNode.prepend(divSearch)

    if(radioTrack.checked){
        div = document.createElement("div")
        title = document.createElement("h5")
        title.innerHTML = "Canzoni dalla ricerca"
        div.append(title)
        divResults = document.createElement("div")
        divResults.id="searchTrack"
        divResults.classList.add("row")
        div.classList.add("container")
        div.append(divResults)
        divSearch.append(div)

        for(let i=0;i<5;i++){
            printCardPlaceholder("searchTrack")
        }

        tracks = await searchTrack(input)
        tracks=tracks.tracks.items
        console.log(tracks)

        printPlaylist(tracks, "searchTrack", "top-template")
    }
    if(radioArtist.checked){
        div = document.createElement("div")
        title = document.createElement("h5")
        title.innerHTML = "Artisti dalla ricerca"
        div.append(title)
        divResults = document.createElement("div")
        divResults.id="searchArtist"
        divResults.classList.add("row")
        div.classList.add("container")
        div.append(divResults)
        divSearch.append(div)

        for(let i=0;i<5;i++){
            printCardPlaceholder("searchArtist")
        }

        artists = await searchArtist(input)
        artists=artists.artists.items
        console.log(artists)
        
        printArtists(artists, "searchArtist", "artist-template")
    }
    if(radioAlbum.checked){
        div = document.createElement("div")
        title = document.createElement("h5")
        title.innerHTML = "Album dalla ricerca"
        div.append(title)
        divResults = document.createElement("div")
        divResults.id="searchAlbum"
        divResults.classList.add("row")
        div.classList.add("container")
        div.append(divResults)
        divSearch.append(div)

        for(let i=0;i<5;i++){
            printCardPlaceholder("searchAlbum")
        }
        
        albums = await searchAlbum(input)
        albums=albums.albums.items
        console.log(albums)

        printAlbum(albums, "searchAlbum" , "album-template")
    }
    if(radioPlaylist.checked){
        div = document.createElement("div")
        title = document.createElement("h5")
        title.id="titleTemp"
        title.innerHTML = "Playlist dalla ricerca"
        div.append(title)

        divResults = document.createElement("div")
        divResults.id="searchPlaylist"
        divResults.classList.add("row")
        div.append(divResults)
        div.classList.add("container")
        divSearch.append(div)

        for(let i=0;i<5;i++){
            printCardPlaceholder("searchPlaylist")
        }

        playlists = await searchPlaylist(input)
        console.log(playlists)

        if(playlists.length==0){
            document.getElementById("searchPlaylist").innerHTML=""
            document.getElementById("titleTemp").innerHTML = "Playlist dalla ricerca: nessun risultato"
        }else{
            printPlaylistCard(playlists, "searchPlaylist", "playlist-template")
        }
    }
}

/**
 * Funzione che stampa in coda al nodo una card placeholder
 * @param {String} id id del node dove fare l'append delle card
 */
function printCardPlaceholder(id){
    div = document.createElement("div")
    div.classList.add("card", "col-2")

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