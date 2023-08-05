import {getFollowedPlaylists, getPublicPlaylist, userLogin, getUser, postUser, putUser, postPlaylist, 
    deletePlaylist, getMyPlaylist, getPlaylist, addFollow, removeFollow, searchPlaylist, searchPlaylistsByTag, deleteUser, 
    changePlaylistVisibility, putTags, putPlaylist} from "./script/backend.js"
import {getTrack, getAlbum, getAlbumByArtist, getArtist, getTopCharts, getTopTracks, searchAlbum, 
    searchArtist, searchTrack, getGenresSpotify, getRecommendations} from "./script/spotify_backend.js"

/**
 * Funzione che verifica se un utente sia loggato o meno
 * @returns true SE l'utente è loggato nell'applicativo, false altrimenti
 */
export function logged(){
    return localStorage.getItem("user") != null
}

/**
 * Funzione che riempie le caselle di input con i dati dell'utemte loggato
 */
export async function loadAccount(){
    document.getElementById("email").value = "Loading..."
    document.getElementById("nickname").value = "Loading..."
    document.getElementById("buttonModify").disabled = true
    var user = await getUser(window.localStorage.getItem("user"))
    document.getElementById("email").value = user.email
    document.getElementById("nickname").value = user.nickname
    document.getElementById("buttonModify").disabled = false
    var taglist = document.getElementById("tagList")
    if(!user.favorite_genres || user.favorite_genres.length==0){
        var nessuno = document.createElement("div")
        nessuno.id="nessuno"
        nessuno.innerHTML = "Nessuno"
        taglist.append(nessuno)
    }else{
        user.favorite_genres.forEach(tag => {
            var newtag = document.createElement("div")
            newtag.classList.add("col-auto", "tag")
            var a = document.createElement("a")
            a.innerHTML = "❌ "
            a.style = "cursor: pointer;text-decoration: none;"
            a.classList.add("link")
            a.addEventListener("click", removeTag)
            var span = document.createElement("span")
            span.classList.add("tagSpan")
            span.innerHTML=tag.name
            newtag.append(span)
            newtag.prepend(a)
            var list = document.getElementById("tagList")
            list.append(newtag)
        });
    }
}

/**
 * Funzione che riempie la select dei generi con quelli ottenuti da Spotify
 */
export async function loadGenres(){
    var genres = await getGenresSpotify()
    var select = document.getElementById("tagInput")
    console.log(genres)
    genres.genres.forEach(genre => {
        var option = document.createElement("option")
        option.innerHTML = genre
        select.append(option)
    });
}

/**
 * Funzione che aggiorna le credenziali di un utente
 */
export async function cambiaCredenziali(){
    var check = document.getElementById("changePassword")
    if(!document.getElementById("errorAlert").classList.contains("visually-hidden")){
        document.getElementById("errorAlert").classList.add("visually-hidden")
        document.getElementById("errorText").innerHTML = ""
    }
    if(!document.getElementById("successAlert").classList.contains("visually-hidden")){
        document.getElementById("successAlert").classList.add("visually-hidden")
    }
    var genresNode = document.getElementsByClassName("tagSpan")
    var genres = []
    Array.prototype.forEach.call(genresNode, function(genre) {
        genres.push({"name" : genre.innerHTML})
    });
    if(check.checked){
        var newpass = document.getElementById("password").value
        if(newpass==""){return}
        var updatedUser = {
            email : document.getElementById("email").value,
            nickname : document.getElementById("nickname").value,
            password : newpass,
            genres: genres==[] ? "" : genres
        }
    }else{
        var updatedUser = {
            email : document.getElementById("email").value,
            nickname : document.getElementById("nickname").value,
            favorite_genres: genres==[] ? "" : genres
        }
    }
    var res = await putUser(window.localStorage.getItem("user"), updatedUser)
    if(res.text){
        document.getElementById("errorAlert").classList.remove("visually-hidden")
        document.getElementById("errorText").innerHTML = res.status + ": " + res.text
    }else{
        document.getElementById("successAlert").classList.remove("visually-hidden")
    }
    console.log(res)
}

/**
 * Funzione che stampa le track migliori in Italia
 */
export async function printTopCharts() {
    var playlist = await getTopCharts()
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
export function printPlaylist(playlist, idNode, idTemplate){
    var template = document.getElementById(idTemplate).cloneNode(true)
    template.classList.remove("visually-hidden")
    document.getElementById(idNode).innerHTML=""
    console.log(playlist)
    
    var pagination = document.createElement("ul")
    pagination.classList.add("pagination", "justify-content-center")

    for (let i=0; i<playlist.length; i+=5){
        //create the row
        var row = document.createElement("div")
        row.classList.add("row", "justify-content-center")
        var newid = idNode+"Row" + (i/5)
        row.id= newid
        document.getElementById(idNode).append(row)
        printTracksCard(playlist.slice(i,i+5), template, newid, i+1)
        // Hide everything
        document.getElementById(newid).classList.add("visually-hidden")

        var page = document.createElement("li")
        page.classList.add("page-item", "page-link", "link")
        page.style = "cursor: pointer"
        page.innerHTML = (i/5) +1
        page.addEventListener("click", showMore)
        pagination.append(page)
    }
    document.getElementById(idNode+"Row0").classList.remove("visually-hidden")
    if(playlist.length>5){
        pagination.childNodes[0].classList.add("active")
        document.getElementById(idNode).append(pagination)
    }
}

/**
 * Funzione che scrive le track della playlist mediante card 
 * @param {Array} playlist array contenente le track
 * @param {Node} template node di base della card da cui clono
 * @param {String} id id del node a cui accodare le varie card
 * @param {int} startCount count da cui far partire il conteggio delle card
 */
export function printTracksCard(playlist, template, id, startCount){
    for (let i=0; i<playlist.length; i++){
        var clone = template.cloneNode(true)
        clone.getElementsByClassName("card-body")[0].value = playlist[i].id
        clone.getElementsByClassName("card-img")[0].addEventListener("click", function(){goToTrack(playlist[i].id)})
        clone.id=id + (i + startCount)
        clone.getElementsByClassName("card-img")[0].classList.add("link")
        clone.getElementsByClassName("card-img")[0].src = playlist[i].album.images[0].url
        clone.getElementsByClassName("nome_traccia")[0].innerHTML = "#" + (i+startCount) + " " +playlist[i].name
        clone.getElementsByClassName("nome_traccia")[0].addEventListener("click", function(){goToTrack(playlist[i].id)})
        clone.getElementsByClassName("nome_traccia")[0].classList.add("link", "cursor")
        clone.getElementsByClassName("nome_artista")[0].innerHTML = playlist[i].artists[0].name
        clone.getElementsByClassName("nome_artista")[0].addEventListener("click", function(){goToArtist(playlist[i].artists[0].id)})
        clone.getElementsByClassName("nome_artista")[0].classList.add("cursor")
        document.getElementById(id).appendChild(clone)
    }
}

/**
 * Visualizza il nodo successivo rispetto a quello del padre
 */
export function showMore(){
    var n_page = this.innerHTML 
    var rows = this.parentNode.parentNode.getElementsByClassName("row")
    for(let i=0;i<rows.length;i++){
        if(!rows[i].classList.contains("visually-hidden")){
            document.getElementById(rows[i].id).classList.add("visually-hidden")
        }
    }
    rows[n_page-1].classList.remove("visually-hidden")
    var pages = this.parentNode.getElementsByClassName("page-item")
    for(let i=0;i<pages.length;i++){
        if(pages[i].classList.contains("active")){
            pages[i].classList.remove("active")
        }
    }
    this.classList.add("active")
}

/**
 * Funzione che stampa le informazioni di una track nel nodo specificato 
 * e stampa le canzoni migliori dell'artista nel node con id 'topTrackArtist'
 * @param {String} idTrack id della track di cui richiedo le informazioni
 * @param {String} idNode id del nodo a cui accodare le informazioni da stampare
 * @param {String} idTemplate id del nodo che verrà utilizzato come template per le track
 */
export async function printTrackInfo(idTrack, idNode, idTemplate){
    var info = await getTrack(idTrack)
    if(info.error){
        alert(info.error.message)
        return
    }
    console.log(info)
    var node = document.createElement("div")
    node.classList.add("row", "justify-content-center")
    var title = document.createElement("h3")
    title.innerHTML = "Titolo: " + info.name
    node.append(title)
    
    var left = document.createElement("div")
    left.classList.add("col-4", "col-sm-12", "col-md-4",)
    var right = document.createElement("ul")
    right.classList.add("col-8","col-sm-12", "col-md-7", "list-group","list-group-flush")
    var img = document.createElement("img")
    img.style="width:100%"
    img.src = info.album.images[0].url
    left.append(img)

    var div = document.createElement("li")
    div.classList.add("list-group-item", "list-group-item-dark")
    div.innerHTML="Artisti: "
    for (let i=0; i<info.artists.length; i++){
        var a = document.createElement("a")
        a.addEventListener("click", function(){goToArtist(info.artists[i].id)})
        a.classList.add("link", "cursor")
        a.innerHTML = info.artists[i].name 
        div.append(a)
        i+1<info.artists.length ? div.append(document.createElement("div").innerHTML=" e ") : null
    }
    right.append(div)

    var div = document.createElement("li")
    div.classList.add("list-group-item", "list-group-item-dark")
    div.innerHTML = "Album: "
    var a = document.createElement("a")
    a.innerHTML = info.album.name
    a.addEventListener("click", function(){goToAlbum(info.album.id)})
    a.classList.add("link", "cursor")
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
        var audio = document.createElement("audio")
        audio.controls="controls"
        var source = document.createElement("source")
        source.src = info.preview_url
        source.type = "audio/mpeg"
        audio.append(source)
        audio.style="width:100%;"
        div.append(audio)
        right.append(div)
    }
    if (logged()){
        var li = document.createElement("li")
        li.classList.add("list-group-item", "list-group-item-dark")
        
        div = document.createElement("div")
        div.innerHTML = "Aggiungi alla playlist: "
        li.append(div)
        div = document.createElement("div")
        var select = document.createElement("select")
        select.id = "myplaylist"
        select.classList.add("form-select")
        select.style = "width:50%"
        var option = document.createElement("option")
        option.innerHTML = "Seleziona una tua playlist"
        select.append(option)
        var myplaylist = await getMyPlaylist(window.localStorage.getItem("user"))
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
        var button = document.createElement("button")
        button.innerHTML="Aggiungi"
        button.id = window.location.href.split("?")[1]
        button.addEventListener("click", addTrackToPlaylist)
        button.classList.add("btn","show", "button-small", "btn-primary")
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
export function msToMinutesAndSeconds(ms) {
    var min = Math.floor(ms / 60000);
    var sec = ((ms % 60000) / 1000).toFixed(0);
    return min + ":" + (sec < 10 ? '0' : '') + sec;
}

/**
 * Funzione che stampa le canzoni migliori di un'artista nel node con id 'topTrackArtist'
 * @param {String} idArtist id dell'artista di cui richiediamo informazioni
 * @param {String} idTemplate id del nodo che verrà utilizzato come template per le track
 */
export async function printTopTrackArtist(idArtist, idTemplate){
    var playlist = await getTopTracks(idArtist)
    if(playlist.error){
        alert(playlist.error.message)
        return
    }
    console.log(playlist)
    printPlaylist(playlist.tracks, "topTrackArtist", idTemplate)
    var nomeArtista = document.createElement("h4")
    nomeArtista.innerHTML = "Top track e feat di "+playlist.tracks[0].artists[0].name
    document.getElementById("topTrackArtist").prepend(nomeArtista)
}

/**
 * Funzione che stampa le informazioni di un'artista congiuntamente alle sue track migliori ed ai suoi album,
 * rispettivamente in un node con id 'topTrackArtist' e in un node con id 'artistAlbum'
 * @param {String} idArtist id dell'artista di cui richiediamo informazioni
 * @param {String} idNode id del nodo a cui si vogliono accodare le informazioni
 */
export async function printArtistInfo(idArtist, idNode){
    var artist = await getArtist(idArtist)
    if(artist.error){
        alert(artist.error.message)
        return
    }
    console.log(artist)
    var node = document.createElement("div")
    node.classList.add("row", "justify-content-center")
    // titolo
    var title = document.createElement("h3")
    title.innerHTML = "Artista: " + artist.name
    node.append(title)
    // divisione in due sezioni della pagina, a sinistra la foto dell'artista e a destra le informazioni
    var left = document.createElement("div")
    left.classList.add("col-4", "col-sm-12", "col-md-4",)
    var img = document.createElement("img")
    img.style="width:100%"
    img.src = artist.images[0].url
    left.append(img)
    var right = document.createElement("ul")
    right.classList.add("col-8","col-sm-12", "col-md-7", "list-group","list-group-flush")

    var li = document.createElement("li")
    li.classList.add("list-group-item", "list-group-item-dark")
    var li_clone = li.cloneNode(true)
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
    var a = document.createElement("a")
    a.innerHTML = artist.followers.total.toLocaleString('en-US')
    li_clone.append(a)
    right.append(li_clone)

    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Aggiungi ai preferiti: "
    var button = document.createElement("button")
    button.innerHTML="Aggiungi"
    li_clone.append(button)
    right.append(li_clone)

    node.append(left)
    node.append(right)
    document.getElementById(idNode).append(node)
}

/**
 * Funzione che stampa le informazioni degli artisti nel nodo specificato utilizzando il template
 * @param {Array} artists array di artisti
 * @param {String} idNode id del nodo a cui si vogliono accodare gli artisti
 * @param {String} idTemplate id del nodo da cui si clona il template da utilizzare
 */
export function printArtists(artists, idNode, idTemplate){
    var node = document.getElementById(idNode)
    node.innerHTML=""
    var template = document.getElementById(idTemplate).cloneNode(true)
    template.classList.remove("visually-hidden")
    var pagination = document.createElement("ul")
    pagination.classList.add("pagination", "justify-content-center")
    for (let i=0; i<artists.length; i+=5){
        var page = document.createElement("li")
        page.classList.add("page-item", "page-link", "link")
        page.style = "cursor: pointer"
        page.innerHTML = (i/5) +1
        page.addEventListener("click", showMore)
        pagination.append(page)

        //create the row
        var row = document.createElement("div")
        row.classList.add("row", "justify-content-center")
        i/5 == 0 ? null : row.classList.add("visually-hidden")
        var newid = idNode+"Row" + (i/5)
        row.id= newid
        node.append(row)

        printArtistsCard(artists.slice(i,i+5), template, newid, i+1)
    }
    if(artists.length>5){
        pagination.childNodes[0].classList.add("active")
        node.append(pagination)
    }
}

/**
 * Funzione che stampa gli informazioni degli artisti con le card
 * @param {Array} artists array contentente le informazioni sugli artisti
 * @param {Node} template nodo da usare come template 
 * @param {String} idNode id del nodo a cui accodare le card 
 * @param {int} startCount count da cui far partire il conteggio delle card
 */
export function printArtistsCard(artists, template, idNode, startCount){
    for(let i=0;i<artists.length;i++){
        var clone = template.cloneNode(true)
        clone.getElementsByClassName("card-img")[0].addEventListener("click", function(){goToArtist(artists[i].id)})
        clone.getElementsByClassName("card-img")[0].classList.add("link", "cursor")
        if(artists[i].images.length!=0){
            clone.getElementsByClassName("card-img")[0].src = artists[i].images[0].url
        }else{
            clone.getElementsByClassName("card-img")[0].src = "/img/music.jpg"
        }
        clone.getElementsByClassName("nome_artista")[0].innerHTML = "#" + (startCount+i) + " " +artists[i].name
        clone.getElementsByClassName("follower")[0].innerHTML = artists[i].followers.total.toLocaleString('en-US')
        document.getElementById(idNode).append(clone)
    }
}

/**
 * Funzione che stampa gli album dell'artista in un node con id 'artistAlbum'
 * @param {String} idArtist id dell'artista di cui si richiedono gli album
 */
export async function printAlbumArtist(idArtist){
    var album = await getAlbumByArtist(idArtist)
    if(album.error){
        alert(album.error.message)
        return
    }
    album = album.items
    // considero solo gli album dell'artista e NON ep o partecipazioni ad altri album
    var onlyalbum = []
    for (let i=0;i<album.length;i++){
        if (album[i].album_group=="album"){
            onlyalbum.push(album[i])
        }
    }
    console.log(onlyalbum)
    if(onlyalbum.length==0){return}

    printAlbum(onlyalbum, "album", "album-template")
    var h4 = document.createElement("h4")
    h4.innerHTML = "Discografia di " + onlyalbum[0].artists[0].name
    document.getElementById("album").prepend(h4)
}

/**
 * Funzione che stampa nel nodo specificato gli album
 * @param {Array} albums array di album
 * @param {String} idNode id del nodo a cui si vogliono accodare gli album
 * @param {String} idTemplate id del nodo da cui si clona il template da utilizzare
 */
export function printAlbum(albums, idNode, idTemplate){
    var node = document.getElementById(idNode)
    var template = document.getElementById(idTemplate).cloneNode(true)
    node.innerHTML=""
    template.classList.remove("visually-hidden")
    var row = document.createElement("div")
    row.id=idNode+"Row0"
    row.classList.add("row", "justify-content-center")
    var pagination = document.createElement("ul")
    pagination.classList.add("pagination", "justify-content-center")
    for (let i=0; i<albums.length; i+=5){
        var page = document.createElement("li")
        page.classList.add("page-item", "page-link", "link")
        page.style = "cursor: pointer"
        page.innerHTML = (i/5)+1
        page.addEventListener("click", showMore)
        pagination.append(page)

        //create the row
        var row = document.createElement("div")
        row.classList.add("row", "justify-content-center")
        i/5 == 0 ? null : row.classList.add("visually-hidden")
        var newid = idNode+"Row" + (i/5)
        row.id= newid
        node.append(row)

        printAlbumsCard(albums.slice(i,i+5), template, newid, i)
    }
    if(albums.length>5){
        pagination.childNodes[0].classList.add("active")
        document.getElementById(idNode).append(pagination)
    }
}

/**
 * Funzione che stampa gli informazioni degli album con le card
 * @param {Array} albums array contentente le informazioni sugli album
 * @param {Node} template nodo da usare come template 
 * @param {String} idNode id del nodo a cui accodare le card 
 * @param {int} startCount count da cui far partire il conteggio delle card
 */
export function printAlbumsCard(albums, template, idNode, startCount){
    for (let i=0;i<albums.length;i++){
        var clone = template.cloneNode(true)
        clone.getElementsByClassName("card-img")[0].addEventListener("click", function(){goToAlbum(albums[i].id)})
        clone.getElementsByClassName("card-img")[0].src = albums[i].images[0].url
        clone.getElementsByClassName("card-img")[0].classList.add("link")
        clone.getElementsByClassName("nome_album")[0].innerHTML = "#" + (i+startCount) + " " +albums[i].name
        clone.getElementsByClassName("nome_album")[0].addEventListener("click", function(){goToAlbum(albums[i].id)})
        clone.getElementsByClassName("nome_album")[0].classList.add("link", "cursor")
        clone.getElementsByClassName("nome_artista")[0].innerHTML = albums[i].artists[0].name
        clone.getElementsByClassName("nome_artista")[0].addEventListener("click", function(){goToArtist(albums[i].artists[0].id)})
        clone.getElementsByClassName("nome_artista")[0].classList.add("cursor")
        document.getElementById(idNode).append(clone)
    }
}

/**
 * Funzione che stampa le informazioni dell'album nel nodo con id specificato,
 * congiuntamente con la lista delle track accodate nel nodo con id 'albumTrack'
 * @param {String} idAlbum id dell'album di cui si cercano le informazioni
 * @param {String} idNode id del nodo in cui accodare le informazioni
 */
export async function printAlbumInfo(idAlbum, idNode){
    var album = await getAlbum(idAlbum)
    if(album.error){
        alert(album.error.message)
        return
    }
    console.log(album)
    // titolo
    var node = document.createElement("div")
    node.classList.add("row", "justify-content-center")
    var title = document.createElement("h3")
    title.innerHTML = "Album: " + album.name
    node.append(title)
    // divisione in due sezioni della pagina, a sinistra la foto dell'album e a destra le informazioni
    var left = document.createElement("div")
    left.classList.add("col-4", "col-sm-12", "col-md-4",)
    var img = document.createElement("img")
    img.style="width:100%"
    img.src = album.images[0].url
    left.append(img)
    var right = document.createElement("ul")
    right.classList.add("col-8","col-sm-12", "col-md-7", "list-group","list-group-flush")

    var li = document.createElement("li")
    li.classList.add("list-group-item", "list-group-item-dark")
    var li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Autori: "  
    var a = document.createElement("a")
    a.innerHTML = album.artists[0].name
    a.addEventListener("click", function(){goToArtist(album.artists[0].id)})
    a.classList.add("link", "cursor")
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
    var date = new Date(album.release_date)
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
export async function printAlbumTrack(tracks){
    console.log(tracks)
    var tracklist = document.createElement("ul")
    tracklist.classList.add("container", "list-group", "list-group-flush")
    // creo il template degli elementi della lista
    var template = document.createElement("li")
    template.classList.add("list-group-item", "list-group-item-dark")
    var row = document.createElement("div")
    row.classList.add("row")
    var col = document.createElement("div")
    col.classList.add("col")
    row.append(col, col.cloneNode(true))
    template.append(row, row.cloneNode(true))
    var myplaylist
    if(logged()){myplaylist = await getMyPlaylist(window.localStorage.getItem("user"))}

    for(let i=0;i<tracks.length;i++){
        var clone = template.cloneNode(true)
        clone.childNodes[0].childNodes[0].innerHTML = "#" + (i+1) + " "
            var a = document.createElement("a")
            a.innerHTML = tracks[i].name
            a.addEventListener("click", function(){goToTrack(tracks[i].id)})
            a.classList.add("link", "cursor")
            clone.childNodes[0].childNodes[0].append(a)
        if(tracks[i].preview_url!=null){
            // la preview per alcuna track non è disponibile
            var audio = document.createElement("audio")
            audio.style = "width:100%"
            audio.controls="controls"
            var source = document.createElement("source")
            source.src = tracks[i].preview_url
            source.type = "audio/mpeg"
            audio.append(source)
            clone.childNodes[0].childNodes[1].append(audio)
        }
        if(logged()){
            // la possibilità di aggiungere la track ad una playlist è possibile solo SE si è loggati
            clone.childNodes[1].childNodes[0].innerHTML = "Aggiungi in una tua playlist"
            var select = document.createElement("select")
            select.classList.add("form-select")
            select.id="myplaylist"
            var option = document.createElement("option")
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
            var button = document.createElement("button")
            button.id=tracks[i].id
            button.innerHTML="Aggiungi"
            button.addEventListener("click", addTrackToPlaylist)
            button.classList.add("btn", "btn-primary", "show")
            clone.childNodes[1].childNodes[1].append(button)
        }
        tracklist.append(clone)
    }

    var title = document.createElement("h4")
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
export async function printMyPlaylists(idNode, idTemplate){
    if (!logged()){return}
    var user = localStorage.getItem("user")
    var node = document.getElementById(idNode)
    for(let i=0;i<5;i++){
        printCardPlaceholder(idNode)
    }
    var playlists = await getMyPlaylist(user)
    console.log(playlists)
    if (playlists.length==0){
        node.innerHTML = ""
        var title = document.createElement("h4")
        title.innerHTML = "Non hai ancora nessuna playlist, creane una "
        var a = document.createElement("a")
        a.href = "/src/newplaylist.html"
        a.innerHTML = "qui"
        title.append(a)
        node.parentNode.append(title)
    }else{
        var title = document.createElement("h4")
        title.innerHTML = "Le tue playlist"
        node.innerHTML = ""
        var template = document.getElementById(idTemplate).cloneNode(true)
        template.classList.remove("visually-hidden")
        var pagination = document.createElement("ul")
        pagination.classList.add("pagination", "justify-content-center")
        for (let i=0;i<playlists.length;i+=5){
            var row = document.createElement("div")
            row.classList.add("row", "justify-content-center")
            i/5 == 0 ? null : row.classList.add("visually-hidden")
            var newid = "MyPlaylistRow"+(i/5)
            row.id = newid
            node.append(row)

            printPlaylistCard(playlists.slice(i,i+5), newid, idTemplate)

            var page = document.createElement("li")
            page.classList.add("page-item", "page-link", "link")
            page.style = "cursor: pointer"
            page.innerHTML = (i/5) +1
            page.addEventListener("click", showMore)
            pagination.append(page)
        }
        if(playlists.length>5){
            pagination.childNodes[0].classList.add("active")
            document.getElementById(idNode).append(pagination)
        }
        node.parentNode.prepend(title)
    }
}

/**
 * Funzione che stampa le playlist 5 playlist per riga
 * @param {Array} playlists array contenente le playlist
 * @param {String} idNode id dove accodare le playlist 
 * @param {String} idTemplate template da utilizzare
 */
export function printPlaylistCard(playlists, idNode, idTemplate){
    var node = document.getElementById(idNode)
    var template = document.getElementById(idTemplate)
    template.classList.remove("visually-hidden")
    for(let i=0;i<playlists.length;i++){
        var div = template.cloneNode(true)
        div.id=""
        div.getElementsByClassName("card-img")[0].src = "../img/music.jpg"
        if(playlists[i].tracks && playlists[i].tracks.length!=0){
            if (playlists[i].tracks[0].info.album.images[0].url){
                div.getElementsByClassName("card-img")[0].src = playlists[i].tracks[0].info.album.images[0].url
            }
        }
        div.getElementsByClassName("card-img")[0].addEventListener("click", function(){goToPlaylist(playlists[i]._id)})
        div.getElementsByClassName("nome_playlist")[0].innerHTML = playlists[i].name
        if(!logged()){
            //niente
        }else if(playlists[i].owner==window.localStorage.getItem("user")){
            var del = document.createElement("div")
            del.classList.add("card-action", "link")
            del.innerHTML = "❌"
            del.addEventListener("click", async function (){deleteThisPlaylist(playlists[i]._id, this)})
            div.getElementsByClassName("nome_playlist")[0].append(del)
        }else{
            var found=false
            for(let k=0;k<playlists[i].followers.length;k++){
                if(window.localStorage.getItem("user") == playlists[i].followers[k].id){
                    var del = document.createElement("div")
                    del.classList.add("card-action", "link")
                    del.innerHTML = "❌"
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
                var del = document.createElement("div")
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
    template.classList.add("visually-hidden")
}

async function deleteThisPlaylist(id, nodeToRemove){
    var res = await deletePlaylist(id)
    console.log(res)
    nodeToRemove.parentNode.parentNode.parentNode.parentNode.remove();
}

/**
 * Funzione che stampa le informazioni di una playlist e le sue track
 * @param {String} id id della playlist
 * @param {String} idNode id del nodo in cui stampare le informazioni
 */
export async function printPlaylistInfo(id, idNode){
    var playlist = await getPlaylist(id)
    if(playlist==undefined){window.location.href = "/src/playlist.html";return;}
    console.log(playlist)

    // titolo
    var node = document.createElement("div")
    node.classList.add("row", "justify-content-center")
    var title = document.createElement("h3")
    title.innerHTML = "Playlist: " + playlist.name
    node.append(title)
    // divisione in due sezioni della pagina, a sinistra la foto della playlist e a destra le informazioni
    var left = document.createElement("div")
    left.classList.add("col-4", "col-sm-12", "col-md-4",)
    var img = document.createElement("img")
    img.style="width:100%"
    if(playlist.tracks && playlist.tracks.length!=0){
        img.src = playlist.tracks[0].info.album.images[0].url
    }else{
        img.src = "../img/music.jpg"
    }

    left.append(img)
    var right = document.createElement("ul")
    right.classList.add("col-8","col-sm-12", "col-md-7", "list-group","list-group-flush")
    //elenco informazioni
    var li = document.createElement("li")
    li.classList.add("list-group-item", "list-group-item-dark")
    //autore
    var li_clone = li.cloneNode(true)
    var autore = ""
    var loggedUser = window.localStorage.getItem("user")
    var isowner = loggedUser && playlist.owner == loggedUser
    if(isowner){
        autore="Tu"
    }else{
        autore = await getUser(playlist.owner)
        autore = autore.nickname
    }
    li_clone.innerHTML = "Autore: "  + autore
    right.append(li_clone)
    //descrizione
    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Descrizione: " + (!playlist.description || playlist.description=="" ? "nessuna" : playlist.description)
    right.append(li_clone)
    //numero dei followers
    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Numero follower: " + playlist.followers.length
    right.append(li_clone)
    //tag
    li_clone = li.cloneNode(true)
    li_clone.classList.add("container")
    var row = document.createElement("div")
    row.classList.add("row")
    var div = document.createElement("div")
    div.innerHTML = "Tag:"
    div.classList.add("col-1")
    row.append(div)
    var taglist = document.createElement("div")
    taglist.id = "tagList"
    taglist.classList.add("row", "col-11")
    if(playlist.tags.length==0){
        div = document.createElement("div")
        div.id= "nessuno"
        div.innerHTML = "Nessuno"
        taglist.append(div)
    }else{
        for(let i=0;i<playlist.tags.length;i++){
            var divtag = document.createElement("div")
            divtag.classList.add("col-auto", "tag")
            if(isowner){
                var a = document.createElement("a")
                a.innerHTML = "❌ "
                a.style = "cursor: pointer; text-decoration: none;"
                a.classList.add("link")
                a.addEventListener("click", removeTag)
                divtag.append(a)
            }
            var span = document.createElement("span")
            span.innerHTML = playlist.tags[i].name
            span.classList.add("tagSpan")
            divtag.append(span)
            taglist.append(divtag)
        }
    }
    row.append(taglist)
    li_clone.append(row)

    if(isowner){
        row = document.createElement("div")
        row.classList.add("row")
        row.style = "margin-top:10px"

        div = document.createElement("div")
        div.classList.add("col")
        var input = document.createElement("input")
        input.type = "text"
        input.classList.add("form-control")
        input.id = "tagInput"
        input.placeholder="Tag della playlist"
        input.autocomplete="off"
        div.append(input)
        row.append(div)

        div = document.createElement("div")
        div.classList.add("col-auto")
        button = document.createElement("button")
        button.classList.add("btn", "btn-primary")
        button.innerHTML="Aggiungi tag"
        button.addEventListener("click", addTag)
        div.append(button)
        row.append(div)

        li_clone.append(row)
        button = document.createElement("button")
        button.classList.add("btn", "btn-primary")
        button.innerHTML="Aggiorna i tag della playlist"
        button.style = "width:100%;margin-top:10px"
        button.value = playlist._id
        button.addEventListener("click", updateTag)
        li_clone.append(button)
    }
    right.append(li_clone)
    //azioni possibili sulla playlist
    li_clone = li.cloneNode(true)
    var div = document.createElement("div")
    div.id = "public"
    div.innerHTML = (playlist.public ? "Playlist pubblica" : "Playlist privata")
    li_clone.append(div)
    if(loggedUser){
        div = document.createElement("div")
        div.classList.add("text-center")
        var button = document.createElement("button")
        button.classList.add("show", "btn-primary", "btn")
        button.value = playlist._id
        if(isowner){
            if(playlist.public){
                button.innerHTML = "Rendi privata"
            }else{
                button.innerHTML = "Rendi pubblica"
            }
            button.addEventListener("click", handlePlaylist)
            div.append(button)
            button = document.createElement("button")
            button.classList.add("show", "btn-danger", "btn")
            button.value = playlist._id
            button.innerHTML = "Cancella la playlist"
            button.addEventListener("click", async function(){
                var res = await deletePlaylist(playlist._id);
                this.remove()
            })
        }else{
            button.innerHTML = "Follow"
            playlist.followers.forEach(follower => {
                if(follower.id == loggedUser){
                    button.innerHTML = "Unfollow"
                }
            });
            button.addEventListener("click", handlePlaylist)
        }
        div.append(button)
        li_clone.append(div)
    }
    right.append(li_clone)

    
    node.append(left)
    node.append(right)
    document.getElementById(idNode).append(node)

    printPlaylistTracks(playlist.tracks, "trackPlaylist")

    if(isowner){
        printRecomandations(playlist._id)
    }
}

/**
 * Funzione che in base all'inner html del nodo, o aggiunge/toglie il follow dell'utente loggato alla playlist,
 * oppure cambia la visibilita della playlist da pubblica a privata e viceversa
 */
async function handlePlaylist(){
    var user = window.localStorage.getItem("user")
    switch(this.innerHTML){
        case "Follow": 
            try {
                var res = await addFollow(this.value, {"id":user})
                this.innerHTML = "Unfollow"
            } catch (error) {

            }
            break;
        case "Unfollow":
            try {
                var res = await removeFollow(this.value, {"id":user})
                this.innerHTML = "Follow"
            } catch (error) {

            }
            break;
        case "Rendi pubblica":
            try {
                var res = await changePlaylistVisibility(this.value, true)
                this.innerHTML = "Rendi privata"
                var visibility = document.getElementById("public")
                visibility.innerHTML = "Playlist pubblica"
            } catch (error) {

            }
            break;
        case "Rendi privata":
            try {
                var res = await changePlaylistVisibility(this.value, false)
                this.innerHTML = "Rendi pubblica"
                var visibility = document.getElementById("public")
                visibility.innerHTML = "Playlist privata"
            } catch (error) {

            }
            break;
    }
}

/**
 * Funzione che stampa le tracks nel nodo specificato
 * @param {Array} tracks array di canzoni da stampare
 * @param {String} idNode id del nodo a cui accodare le canzoni della playlist
 */
export async function printPlaylistTracks(tracks, idNode){
    var node = document.getElementById(idNode)
    node.innerHTML = ""
    var title = document.createElement("h4")
    if(tracks.length==0){
        title.innerHTML = "Nessuna canzone nella playlist"
        node.append(title)
    }else{
        var tracklist = document.createElement("ul")
        tracklist.classList.add("container", "list-group", "list-group-flush")
        // creo il template degli elementi della lista
        var template = document.createElement("li")
        template.classList.add("list-group-item", "list-group-item-dark")
        var row = document.createElement("div")
        row.classList.add("row")
        var col = document.createElement("div")
        col.classList.add("col")
        row.append(col, col.cloneNode(true))
        template.append(row, row.cloneNode(true))
        
        var myplaylist
        if(logged()){
            myplaylist = await getMyPlaylist(window.localStorage.getItem("user"))
        }

        for(let i=0;i<tracks.length;i++){
            var clone = template.cloneNode(true)
            clone.childNodes[0].childNodes[0].innerHTML = "#" + (i+1) + " "
                var a = document.createElement("a")
                a.innerHTML = tracks[i].info.name
                a.addEventListener("click", function(){goToTrack(tracks[i].info.id)})
                a.classList.add("link", "cursor")
                clone.childNodes[0].childNodes[0].append(a)
            if(tracks[i].info.preview_url!=null){
                // la preview per alcuna track non è disponibile
                var audio = document.createElement("audio")
                audio.style = "width:100%"
                audio.controls="controls"
                var source = document.createElement("source")
                source.src = tracks[i].info.preview_url
                source.type = "audio/mpeg"
                audio.append(source)
                clone.childNodes[0].childNodes[1].append(audio)
            }else{
                clone.childNodes[1].style = "margin-top:10px"
            }
            if(logged()){
                // la possibilità di aggiungere la track ad una playlist è possibile solo SE si è loggati

                clone.childNodes[1].childNodes[0].classList.add("text-center")
                clone.childNodes[1].childNodes[1].classList.add("text-center")
                var button = document.createElement("button")
                button.id=tracks[i].info.id
                button.innerHTML="Aggiungi in una tua playlist"
                button.addEventListener("click", addTrackToPlaylistFromSelect)
                button.classList.add("btn", "btn-primary", "show")
                button.style = "margin:0;"
                clone.childNodes[1].childNodes[0].append(button)

                var select = document.createElement("select")
                select.classList.add("form-select")
                select.style = "margin-top:10px;"
                select.id="myplaylist"
                var option = document.createElement("option")
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
            }
            tracklist.append(clone)
        }

        var title = document.createElement("h4")
        title.innerHTML = "Tracklist della playlist"
        document.getElementById(idNode).append(tracklist)
        document.getElementById(idNode).prepend(title)
    }
}

export async function addTrackToPlaylistFromSelect(){
    var id = this.id
    var info = await getTrack(id)
    var track = {"id" : id, "info":info}
    var select = this.parentNode.parentNode.childNodes[1].childNodes[0]
    var playlist = select.value
    if(playlist=="Seleziona una tua playlist"){alert("Seleziona una tua playlist");return}
    console.log((track))
    var res = await putPlaylist(playlist, track)
    if(res){
        alert("Canzone aggiunta alla playlist")
        for(let i=0;i<select.childNodes.length;i++){
            if(select.childNodes[i].value==playlist){
                select.childNodes[i].remove()
                break
            }
        }
    }
}

export async function addTrackToPlaylist(){
    var id = this.id
    var info = await getTrack(id)
    var track = {"id" : id, "info":info}
    var playlist = this.parentNode.childNodes[0].value
    if(playlist=="Seleziona una tua playlist"){alert("Seleziona una tua playlist");return}
    console.log((track))
    var res = await putPlaylist(playlist, track)
    if(res){
        alert("Canzone aggiunta alla playlist")
    }
}

/**
 * Funzione che stampa i suggerimenti per un utente
 */
export async function printRecomandations(id){
    var iduser = window.localStorage.getItem("user")
    if(!iduser){return}
    var user = await getUser(iduser)
    var genres = user.favorite_genres[0].name
    for(let i=1;i<user.favorite_genres.length;i++){
        genres += ", " +  user.favorite_genres[i].name
    }
    var res = await getRecommendations(genres)
    var recommendations = res.tracks
    console.log(recommendations)
    printPlaylist(recommendations, "recommendations", "track-template")
    var title = document.createElement("h4")
    title.innerHTML = "Suggerimenti"
    document.getElementById("recommendations").prepend(title)

    var cards = document.getElementsByClassName("card")
    for(let i=0; i<cards.length;i++){
        var add = document.createElement("div")
        add.classList.add("card-action", "link")
        add.style = "padding:10px 0; cursor:pointer"
        add.value = id + ";" + cards[i].getElementsByClassName("card-body")[0].value
        add.innerHTML = "➕"
        add.addEventListener("click", addTrackToThisPlaylist)
        cards[i].append(add)
    }
}

export async function addTrackToThisPlaylist(){
    var idPlaylist = this.value.split(";")[0]
    var idTrack = this.value.split(";")[1]
    console.log(idPlaylist)
    console.log(idTrack)
    var track = await getTrack(idTrack)
    track = {"id" : idTrack, "info" : track}
    var res = await putPlaylist(idPlaylist, track)
}

/**
 * Funzione che stampa le playlist seguite dall'utente loggato
 * SE non si è loggati, il div followedPlaylists viene svuotato
 */
export async function printFollowedPlaylists(){
    if (!logged()){
        document.getElementById("followedPlaylists").innerHTML = ""
        return
    }
    var user = window.localStorage.getItem("user")
    var title = document.createElement("h4")
    title.innerHTML = "Le playlist che segui"
    document.getElementById("followedPlaylists").parentNode.prepend(title)
    for(let i=0;i<5;i++){
        printCardPlaceholder("followedPlaylists")
    }
    var followedPlaylists = await getFollowedPlaylists(user)
    console.log(followedPlaylists)
    if(followedPlaylists.length==0){
        document.getElementById("followedPlaylists").innerHTML = ""
        title.innerHTML = "Non segui ancora nessuna playlist"
    }else{
        var template = document.getElementById("playlist-template").cloneNode(true)
        template.classList.remove("visually-hidden")
        var pagination = document.createElement("ul")
        pagination.classList.add("pagination", "justify-content-center")
        for(let i=0;i<followedPlaylists.length;i+=5){
            var row = document.createElement("div")
            row.classList.add("row", "justify-content-center")
            i/5 == 0 ? null : row.classList.add("visually-hidden")
            var newid = "FollowedPlaylistsRow"+(i/5)
            row.id = newid
            node.append(row)

            printPlaylistCard(followedPlaylists.slice(i, i+5), newid, idTemplate)

            var page = document.createElement("li")
            page.classList.add("page-item", "page-link", "link")
            page.style = "cursor: pointer"
            page.innerHTML = (i/5) +1
            page.addEventListener("click", showMore)
            pagination.append(page)
        }
    }
    document.getElementById("followedPlaylists").parentNode.prepend(title)
}

/**
 * Funcione che stampa le playlist pubbliche
 */
export async function printPublicPlaylists(){
    var node = document.getElementById("publicPlaylists")
    var playlists = await getPublicPlaylist()
    console.log(playlists)
    var title = document.createElement("h4")
    if(playlists.length == 0){
        title.innerHTML = "Oh no, non ci sono ancora playlist pubbliche"
    }else{
        var template = document.getElementById("playlist-template").cloneNode(true)
        template.classList.remove("visually-hidden")
        var pagination = document.createElement("ul")
        pagination.classList.add("pagination", "justify-content-center")
        for(let i=0;i<playlists.length; i+=5){
            var row = document.createElement("div")
            row.classList.add("row", "justify-content-center")
            i/5 == 0 ? null : row.classList.add("visually-hidden")
            var newid = "FollowedPlaylistsRow"+(i/5)
            row.id = newid
            node.append(row)

            printPlaylistCard(playlists.slice(i, i+5), newid, "playlist-template")

            var page = document.createElement("li")
            page.classList.add("page-item", "page-link", "link")
            page.style = "cursor: pointer"
            page.innerHTML = (i/5) +1
            page.addEventListener("click", showMore)
            pagination.append(page)
        }

        title.innerHTML = "Esplora le playlist pubbliche"
    }
    node.parentNode.prepend(title)
}

/**
 * Funzione che stampa la navbar nel nodo il cui id è passato come argomento
 * @param {String} id id del nodo in cui stampare la navbar 
 */
export async function printNavBar(id){
    var navdiv = document.createElement("div")
    var titlenav = document.createElement("h3")
    titlenav.innerHTML = "Menu"
    navdiv.appendChild(titlenav)
    if (!logged()){
        var anav = document.createElement("a")
        anav.classList.add("nav","nav-link")
        anav.innerHTML="Home"
        anav.href="/"
        navdiv.appendChild(anav)

        var sub = document.createElement("h5")
        sub.innerHTML = "Per accedere alle funzionalità complete, effettua il login o registrati"
        navdiv.append(sub)

        anav = document.createElement("a")
        anav.innerHTML = "Accedi o registrati"
        anav.href = "/src/login.html"
        navdiv.append(anav)
    }else{
        titlenav = document.createElement("h4")
        var nickname = (window.localStorage.getItem("nickname"))
        if(nickname){
            titlenav.innerHTML = "Benvenuto " + nickname
        }
        
        navdiv.append(titlenav)
        var nav = document.createElement("nav")
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
 * Funzione che stampa in coda al nodo una card placeholder
 * @param {String} id id del node dove fare l'append delle card
 */
export function printCardPlaceholder(id){
    var div = document.createElement("div")
    div.classList.add("card", "col-2")

    var node = document.createElement("div")
    node.classList.add("card-body")
    var title = document.createElement("h5")
    title.classList.add("card-title", "placeholder-glow")
    var p = document.createElement("p")
    p.classList.add("card-text", "placeholder-glow")

    var span = document.createElement("span")
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

/**
 * Funzione che, dati i valori contenuti in due input text con id email e password, crea un nuovo utente nel db
 * SE si verificano degli errori, li stampa in un alert 
 */
export async function addUser(){
    if(document.getElementById("errorAlert").classList.contains("visually-hidden")){
        document.getElementById("errorAlert").classList.add("visually-hidden")
        document.getElementById("errorAlert").innerHTML = ""
    }
    var email = document.getElementById("email").value
    var password = document.getElementById("password").value
    var nickname = document.getElementById("user").value
    var genresNode = document.getElementsByClassName("tagSpan")
    var genres = []
    Array.prototype.forEach.call(genresNode, function(genre) {
        genres.push({"name" : genre.innerHTML})
    });
    var user = {
        email: email,
        password: password,
        nickname: nickname,
        favorite_genres: genres==[] ? "" : genres
    }
    console.log(user)
    var res = await postUser(user)
    console.log(res)
    if (!res.status){
        localStorage.setItem("user", res.insertedId)
        localStorage.setItem("nickname", nickname)
        if(document.getElementById("errorAlert").classList.contains("visually-hidden")){
            document.getElementById("errorAlert").classList.add("visually-hidden")
            document.getElementById("errorAlert").innerHTML = ""
        }
        document.getElementById("successAlert").classList.remove("visually-hidden")
        document.getElementById("userForm").innerHTML = ""
    }else{
        document.getElementById("errorAlert").classList.remove("visually-hidden")
        document.getElementById("errorAlert").innerHTML = res.status + ": " + res.text
    }
}

/**
 * Funzione che cancella l'account dell'utente loggato
 */
export async function deleteAccount(){
    var id = window.localStorage.getItem("user")
    var res = await deleteUser(id)
    if(res.ok){
        logout()
        window.location.href = "../"
    }
}

/**
 * Funziome che preleva l'email e la password da due input e fa una richiesta al db 
 * per verificare se mail e password corrispondo ad un utente 
 */
export async function login(){
    if(document.getElementById("errorAlert").classList.contains("visually-hidden")){
        document.getElementById("errorAlert").classList.add("visually-hidden")
        document.getElementById("errorAlert").innerHTML = ""
    }
    var email = document.getElementById("login_email").value
    var password = document.getElementById("login_password").value
    var user = {
        email: email,
        password: password
    }
    var res = await userLogin(user)
    console.log(res)
    if (!res.status) {
        localStorage.setItem("user", res.loggedUser._id)
        localStorage.setItem("nickname", res.loggedUser.nickname)
        window.location.href = document.referrer
    } else {
        document.getElementById("errorAlert").classList.remove("visually-hidden")
        document.getElementById("errorAlert").innerHTML = res.status + ": " + res.text
    }
    
}

/**
 * Funzione che effettua il logout rimuovendo dal local storage le informazioni dell'utente
 */
export function logout(){
    localStorage.removeItem("user")
    localStorage.removeItem("nickname")
}

/**
 * Funzione che crea una nuova playlist 
 */
export async function addPlaylist(){
    var nome = document.getElementById("nome").value
    var owner = window.localStorage.getItem("user")
    var publics = document.getElementById("public").checked
    var description = document.getElementById("descrizione").value
    var tracks = []
    var tags = []
    var followers = []
    var tagsNode = document.getElementsByClassName("tagSpan")
    if(!document.getElementById("errorAlert").classList.contains("visually-hidden")){
        document.getElementById("errorAlert").classList.add("visually-hidden")
        document.getElementById("errorText").innerHTML = ""
    }
    if(tags){
        Array.prototype.forEach.call(tagsNode, function(tag) {
            tags.push({"name" : tag.innerHTML})
        });
    }
    var playlist = {
        name: nome,
        owner: owner,
        tracks: tracks,
        public: publics,
        description: description,
        tags: tags,
        followers: followers
    }
    var res = await postPlaylist(playlist)
    console.log(res)
    if(res.text){
        document.getElementById("errorAlert").classList.remove("visually-hidden")
        document.getElementById("errorText").innerHTML = res.status + ": " + res.text
    }else{
        goToPlaylist(res.insertedId)
    }
}

/**
 * Funzione che aggiunge un nuovo tag presente nell'input con id "tagInput" SE non è già presente
 */
export function addTag(){
    var tag = document.getElementById("tagInput").value
    document.getElementById("tagInput").value=""
    if (tag!=""){
        var tags = document.getElementsByClassName("tagSpan")
        if(tags){
            var find=false
            Array.prototype.forEach.call(tags, function(el) {
                if(el.innerHTML==tag){
                    find=true
                    return
                }
            });
            if(find){return}
        }
        var newtag = document.createElement("div")
        newtag.classList.add("col-auto", "tag")
        var a = document.createElement("a")
        a.innerHTML = "❌ "
        a.style = "cursor: pointer;text-decoration: none;"
        a.classList.add("link")
        a.addEventListener("click", removeTag)
        var span = document.createElement("span")
        span.classList.add("tagSpan")
        span.innerHTML=tag
        newtag.append(span)
        newtag.prepend(a)
        var list = document.getElementById("tagList")
        var nessuno = document.getElementById("nessuno")
        if (nessuno){nessuno.remove()}
        list.append(newtag)
    }
}

/**
 * Funzione che rimuove il tag selezionato e, nel caso fosse l'ultimo, aggiunge il messaggio "Nessuno"
 */
export function removeTag(){
    this.parentNode.remove()
    if (document.getElementsByClassName("tag").length==0){
        var div = document.createElement("div")
        div.classList.add("col-3")
        div.innerHTML="Nessuno"
        div.id="nessuno"
        document.getElementById("tagList").append(div)
    }
}

/**
 * Funzione che aggiorna i tag di una playlist
 */
export async function updateTag(){
    var tags = []
    var id = this.value
    var tagslist = document.getElementsByClassName("tagSpan")
    Array.prototype.forEach.call(tagslist, function(tag) {
        tags.push({"name":tag.innerHTML})
    });
    await putTags(id,tags)
}

/**
 * Funcione che disattiva lo switch all non appena un altro switch viene disattivato
 */
export function uncheckAllSwitch(){
    var check = this.checked
    if(!check){
        document.getElementById("all").checked = false
    }
}

/**
 * Funzione che attiva tutti i parametri di ricercca quando lo switch all viene attivato
 */
export function checkAll(){
    var check = this.checked
    document.getElementById("track").checked = check
    document.getElementById("artist").checked = check
    document.getElementById("album").checked = check
    document.getElementById("playlist").checked = check
    document.getElementById("tag").checked = check
}

/**
 * Funzione che, dato il valore presente nell'input e lo stato dei 4 switch, fa una ricerca 
 * in base all'input per ogni categoria selezionata
 */
export async function verifySearch(){
    var input = document.getElementById("input").value
    if(input==""){return}
    var radioTrack = document.getElementById("track")
    var radioArtist = document.getElementById("artist")
    var radioAlbum = document.getElementById("album")
    var radioPlaylist = document.getElementById("playlist")
    var radioTag = document.getElementById("tag")
    if(!(radioTrack.checked || radioArtist.checked || radioAlbum.checked || radioPlaylist.checked || radioTag.checked)){return}

    var prevSearch = document.getElementById("searchResult")
    if(prevSearch){prevSearch.remove()}
    var divSearch = document.createElement("div")
    divSearch.id="searchResult"
    var title = document.createElement("h4")
    title.innerHTML = "Risultati ricerca"
    divSearch.append(title)
    document.getElementById("myPlaylists").parentNode.prepend(divSearch)

    if(document.getElementById("all").checked){
        printSearchTrack(input, divSearch)
        printSearchArtist(input, divSearch)
        printSearchAlbum(input, divSearch)
        printSearchPlaylist(input, divSearch)
        printSearchTag(input, divSearch)
        return
    }

    if(radioTrack.checked){
        printSearchTrack(input, divSearch)
    }
    if(radioArtist.checked){    
        printSearchArtist(input, divSearch)
    }
    if(radioAlbum.checked){
        printSearchAlbum(input, divSearch)
    }
    if(radioPlaylist.checked){
        printSearchPlaylist(input, divSearch)
    }
    if(radioTag.checked){
        printSearchTag(input, divSearch)
    }
}

/**
 * Funzione che, dato il valore presente nell'input, accoda nel nodo le track trovate
 * @param {String} input input utilizzato per la ricerca
 * @param {Node} divSearch nodo in cui stampare i risultati
 */
export async function printSearchTrack(input, divSearch){
    var div = document.createElement("div")
    var title = document.createElement("h5")
    title.innerHTML = "Canzoni dalla ricerca"
    div.append(title)
    var divResults = document.createElement("div")
    divResults.id="searchTrack"
    divResults.classList.add("row")
    div.classList.add("container")
    div.append(divResults)
    divSearch.append(div)

    for(let i=0;i<5;i++){
        printCardPlaceholder("searchTrack")
    }
    var tracks = await searchTrack(input)
    tracks=tracks.tracks.items
    console.log(tracks)
    printPlaylist(tracks, "searchTrack", "top-template")
}

/**
 * Funzione che, dato il valore presente nell'input, accoda nel nodo gli artisti trovati
 * @param {String} input input utilizzato per la ricerca
 * @param {Node} divSearch nodo in cui stampare i risultati
 */
export async function printSearchArtist(input, divSearch){
    var div = document.createElement("div")
    var title = document.createElement("h5")
    title.innerHTML = "Artisti dalla ricerca"
    div.append(title)
    var divResults = document.createElement("div")
    divResults.id="searchArtist"
    divResults.classList.add("row")
    div.classList.add("container")
    div.append(divResults)
    divSearch.append(div)
 
    for(let i=0;i<5;i++){
        printCardPlaceholder("searchArtist")
    }

    var artists = await searchArtist(input)
    artists=artists.artists.items
    console.log(artists)
        
    printArtists(artists, "searchArtist", "artist-template")
}

/**
 * Funzione che, dato il valore presente nell'input, accoda nel nodo gli album trovati
 * @param {String} input input utilizzato per la ricerca
 * @param {Node} divSearch nodo in cui stampare i risultati
 */
export async function printSearchAlbum(input, divSearch){
    var div = document.createElement("div")
    var title = document.createElement("h5")
    title.innerHTML = "Album dalla ricerca"
    div.append(title)
    var divResults = document.createElement("div")
    divResults.id="searchAlbum"
    divResults.classList.add("row")
    div.classList.add("container")
    div.append(divResults)
    divSearch.append(div)

    for(let i=0;i<5;i++){
        printCardPlaceholder("searchAlbum")
    }
        
    var albums = await searchAlbum(input)
    albums=albums.albums.items
    console.log(albums)

    printAlbum(albums, "searchAlbum" , "album-template")
}

/**
 * Funzione che, dato il valore presente nell'input, accoda nel nodo le playlist trovate
 * @param {String} input input utilizzato per la ricerca
 * @param {Node} divSearch nodo in cui stampare i risultati
 */
export async function printSearchPlaylist(input, divSearch){
    var div = document.createElement("div")
    var title = document.createElement("h5")
    title.id="titleTemp"
    title.innerHTML = "Playlist dalla ricerca"
    div.append(title)

    var divResults = document.createElement("div")
    divResults.id="searchPlaylist"
    divResults.classList.add("row")
    div.append(divResults)
    div.classList.add("container")
    divSearch.append(div)

    for(let i=0;i<5;i++){
        printCardPlaceholder("searchPlaylist")
    }

    var playlists = await searchPlaylist(input)
    console.log(playlists)

    if(playlists.length==0){
        document.getElementById("searchPlaylist").innerHTML=""
        document.getElementById("titleTemp").innerHTML = "Playlist dalla ricerca: nessun risultato"
    }else{
        var node = document.getElementById("searchPlaylist")
        var template = document.getElementById("playlist-template").cloneNode(true)
        template.classList.remove("visually-hidden")
        var pagination = document.createElement("ul")
        pagination.classList.add("pagination", "justify-content-center")
        for(let i=0;i<playlists.length; i+=5){
            var row = document.createElement("div")
            row.classList.add("row", "justify-content-center")
            i/5 == 0 ? null : row.classList.add("visually-hidden")
            var newid = "searchByPlaylistRow"+(i/5)
            row.id = newid
            node.append(row)

            printPlaylistCard(playlists.slice(i, i+5), newid, "playlist-template")

            var page = document.createElement("li")
            page.classList.add("page-item", "page-link", "link")
            page.style = "cursor: pointer"
            page.innerHTML = (i/5) +1
            page.addEventListener("click", showMore)
            pagination.append(page)
        }
    }
}

/**
 * Funzione che, dato il valore presente nell'input, accoda nel nodo le playlist trovate
 * @param {String} input input utilizzato per la ricerca
 * @param {Node} divSearch nodo in cui stampare i risultati
 */
export async function printSearchTag(input, divSearch){
    var div = document.createElement("div")
    var title = document.createElement("h5")
    title.id="titleTemp"
    title.innerHTML = "Playlist dalla ricerca"
    div.append(title)

    var divResults = document.createElement("div")
    divResults.id="searchPlaylist"
    divResults.classList.add("row")
    div.append(divResults)
    div.classList.add("container")
    divSearch.append(div)

    for(let i=0;i<5;i++){
        printCardPlaceholder("searchPlaylist")
    }

    var playlists = await searchPlaylistsByTag(input)
    console.log(playlists)

    if(playlists.length==0){
        document.getElementById("searchPlaylist").innerHTML=""
        document.getElementById("titleTemp").innerHTML = "Playlist dalla ricerca: nessun risultato"
    }else{
        var node = document.getElementById("searchPlaylist")
        var template = document.getElementById("playlist-template").cloneNode(true)
        template.classList.remove("visually-hidden")
        var pagination = document.createElement("ul")
        pagination.classList.add("pagination", "justify-content-center")
        for(let i=0;i<playlists.length; i+=5){
            var row = document.createElement("div")
            row.classList.add("row", "justify-content-center")
            i/5 == 0 ? null : row.classList.add("visually-hidden")
            var newid = "searchByTagRow"+(i/5)
            row.id = newid
            node.append(row)

            printPlaylistCard(playlists.slice(i, i+5), newid, "playlist-template")

            var page = document.createElement("li")
            page.classList.add("page-item", "page-link", "link")
            page.style = "cursor: pointer"
            page.innerHTML = (i/5) +1
            page.addEventListener("click", showMore)
            pagination.append(page)
        }
    }
}

/**
 * Funzione che porta alla pagina web che visualizza le informazioni di una track
 * @param {String} id id di una playlist
 */
export function goToTrack(id){
    window.location.href = "/src/track.html?" + id
}

/**
 * Funzione che porta alla pagina web che visualizza le informazioni di un artista
 * @param {String} id id dell'artista 
 */
export function goToArtist(id){
    window.location.href = "/src/artist.html?" + id
}

/**
 * Funzione che porta alla pagina web che visualizza le informazioni di una album
 * @param {String} id id dell'album
 */
export function goToAlbum(id){
    window.location.href = "/src/album.html?" + id
}

/**
 * Funzione che porta alla pagina web che visualizza le informazioni di una playlist
 * @param {String} id id della playlist
 */
export function goToPlaylist(id){
    window.location.href = "/src/infoplaylist.html?" + id
}