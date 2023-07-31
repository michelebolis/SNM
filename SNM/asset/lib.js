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
 * Funzione che effettua la chiamata all'API per aggiungere un nuovo utente
 * @param {*} user json contenente email, nickname e password
 * @returns json contenente l'id del nuovo utente oppure un errore nel formato json {text, status}
 */
async function postUser(user){
    return fetch("http://127.0.0.1:3100/users?apikey=123456", {
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
 * Funzione che effettua la chiamata all'API che aggiunge una nuova playlist
 * @param {*} playlist json contenente la playlist da aggiungere
 */
async function postPlaylist(playlist) {
    fetch("http://127.0.0.1:3100/playlist?apikey=123456", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(playlist)
    }).then(async response => {
        if (response.ok) {
            console.log("SIIII")
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
    return fetch("http://127.0.0.1:3100/playlists/"+id+"?apikey=123456", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni su una track
 * @param {*} id id di Spotify della traccia
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
 * @param {*} id id di Spotify dell'album
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
 * @param {*} id id di Spotify dell'artista
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
 * @param {*} id id di Spotify dell'artista 
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
 * @param {*} id id di Spotify dell'artista
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
 * Funzione che verifica se un utente sia loggato o meno
 * @returns true SE l'utente è loggato nell'applicativo, false altrimenti
 */
function logged(){
    return localStorage.getItem("user") != null
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
    printPlaylist(playlist, "top")
}

/**
 * Funzione che stampa le tracks contenente nella playlist, visualizzate con il titolo, immagine della canzone e nome dell'artista
 * @param {Array} playlist Array contenente le track da stampare
 * @param {String} idNode id del node in cui stampare le track
 */
function printPlaylist(playlist, idNode){
    template = document.getElementById(idNode +'-template').cloneNode(true)
    template.classList.remove("visually-hidden")
    document.getElementById(idNode).innerHTML=""
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
        newid = idNode+"Row" + (i/10)
        row.id= newid
        document.getElementById(idNode).append(row)
        printTracksCard(playlist.slice(i,i+10), template, newid, i+1)
        // append the button and hide everything
        document.getElementById(newid).append(newButton)
        document.getElementById(newid).classList.add("visually-hidden")
    }
    document.getElementById(idNode+"Row0").classList.remove("visually-hidden")
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
        clone.classList.add("link")
        clone.addEventListener("click", function move(){window.location.href = "/src/track.html?" + playlist[i].id})
        clone.id=id + (i + startCount)
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
 */
async function printTrackInfo(idTrack, idNode){
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
    img.src = info.album.images[1].url
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
    }

    node.append(left)
    node.append(right)
    document.getElementById(idNode).append(node)

    printTopTrackArtist(info.artists[0].id)
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
 */
async function printTopTrackArtist(idArtist){
    playlist = await getTopTracks(idArtist)
    if(playlist.error){
        alert(playlist.error.message)
        return
    }
    console.log(playlist)
    printPlaylist(playlist.tracks, "topTrackArtist")
    document.getElementById("showMore_0").remove() // considero che le top track sono sempre 10
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
    img.src = artist.images[1].url
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
    h4 = document.createElement("h4")
    h4.innerHTML = "Discografia di " + onlyalbum[0].artists[0].name
    document.getElementById("album").prepend(h4)
    template = document.getElementById("album-template")
    for (let i=0; i<onlyalbum.length; i++){
        clone = template.cloneNode(true)
        clone.classList.add("link")
        clone.classList.remove("visually-hidden")
        clone.addEventListener("click", function move(){window.location.href = "/src/album.html?" + onlyalbum[i].id})
        clone.id=id + (i + 1)
        clone.getElementsByClassName("card-img-album")[0].src = onlyalbum[i].images[0].url
        clone.getElementsByClassName("nome_album")[0].innerHTML = "#" + (i+1) + " " +onlyalbum[i].name
        clone.getElementsByClassName("nome_artista")[0].innerHTML = onlyalbum[i].artists[0].name
        document.getElementById("artistAlbum").append(clone)
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
    img.src = album.images[1].url
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
function printAlbumTrack(tracks){
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
                option = document.createElement("option")
                option.innerHTML = "Seleziona una tua playlist"
            select.append(option)
            clone.childNodes[1].childNodes[1].append(select)
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
 * @param {0} idNode id dove accodare le playlist 
 * @param {*} idTemplate id dove reperire il template da utilizzare
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
        template = document.getElementById(idTemplate).cloneNode(true)
        template.classList.remove("visually-hidden")
        document.getElementById(idTemplate).remove()
        title = document.createElement("h4")
        title.innerHTML = "Le tue playlist"
        node.append(title)
        row = document.createElement("div")
        row.classList.add("row")
        node.append(row)
        node = row
        for(let i=0;i<playlists.length;i++){
            div = template.cloneNode(true)
            div.getElementsByClassName("nome_playlist")[0].innerHTML = playlists[i].name
            node.append(div)
        }
    }
}

/**
 * 
 * @returns 
 */
function printFollowedPlaylists(){
    if (!logged()){return}
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
    if (!logged()){
        a = document.createElement("a")
        a.classList.add("nav","nav-link")
        a.innerHTML="Home"
        a.href="/"
        navdiv.appendChild(a)

        node = document.createElement("h5")
        node.innerHTML = "Per accedere alle funzionalità complete, effettua il login o registrati"
        navdiv.append(node)

        node = document.createElement("a")
        node.innerHTML = "Accedi o registrati"
        node.href = "/src/login.html"
        navdiv.append(node)
    }else{
        title = document.createElement("h4")
        title.innerHTML = "Benvenuto " 
        
        navdiv.append(title)
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
        a.href="/src/newplaylist.html"
        node.appendChild(a)

        a = document.createElement("a")
        a.classList.add("nav-link")
        a.innerHTML="Gestisci le tue playlist"
        a.href="/src/playlist.html"
        node.appendChild(a)

        a = document.createElement("a")
        a.classList.add("nav-link")
        a.innerHTML="Gestisci il tuo account"
        a.href="/src/account.html"
        node.appendChild(a)

        a = document.createElement("a")
        a.classList.add("nav-link")
        a.innerHTML="Logout"
        a.addEventListener("click", logout)
        a.href=window.location.href
        node.appendChild(a)

        navdiv.append(node)
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
        tags: tags
    }
    await postPlaylist(playlist)
}

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