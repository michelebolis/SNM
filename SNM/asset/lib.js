import {getFollowedPlaylists, getPublicPlaylist, userLogin, getUser, postUser, putUser, postPlaylist, 
    deletePlaylist, getMyPlaylist, getPlaylist, addFollow, removeFollow, searchPlaylist, searchPlaylistsByTag, deleteUser, 
    changePlaylistVisibility, putTags, putPlaylist, removeTrack, searchPlaylistsByTrack, putNamePlaylist, putDescriptionPlaylist} from "./script/backend.js"
import {getTrack, getAlbum, getAlbumByArtist, getArtist, getTopCharts, getTopTracks, searchAlbum, 
    searchArtist, searchTrack, getGenresSpotify, getRecommendations} from "./script/spotify_backend.js"

// USER FUNCTION
/**
 * Funzione che verifica se un utente sia loggato o meno
 * @returns true SE l'utente è loggato nell'applicativo, false altrimenti
 */
export function logged(){
    return localStorage.getItem("user") != null
}

/**
 * Funzione che, dati i valori contenuti in due input text con id email e password, crea un nuovo utente nel db
 * SE si verificano degli errori, li stampa in un alert 
 */
export async function addUser(){
    // Nascondo eventuali alert
    if(document.getElementById("errorAlert").classList.contains("visually-hidden")){
        document.getElementById("errorAlert").classList.add("visually-hidden")
        document.getElementById("errorAlert").innerHTML = ""
    }

    // Recupero le informazioni del nuovo utente
    var email = document.getElementById("email").value
    var password = document.getElementById("password").value
    var nickname = document.getElementById("user").value
    var genresNode = document.getElementsByClassName("tagSpan")
    var genres = []
    Array.prototype.forEach.call(genresNode, function(genre) {
        genres.push({"name" : genre.innerHTML})
    });

    // Creo il JSON
    var user = {
        email: email,
        password: password,
        nickname: nickname,
        favorite_genres: genres==[] ? "" : genres
    }
    console.log(user)

    // Aggiungo il nuovo utente
    var res = await postUser(user)
    console.log(res)
    if (!res.status){
        // Aggiungo al localStorage l'id dell'utente e il nickname
        localStorage.setItem("user", res.insertedId)
        localStorage.setItem("nickname", nickname)

        // Mostro l'alert di successo
        document.getElementById("successAlert").classList.remove("visually-hidden")
        document.getElementById("userForm").innerHTML = ""
    }else{
        // SE vi è un errore, mostro l'alert di errore con il messaggio di errore
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
    // Nascondo eventuali alert di errori precedenti
    if(document.getElementById("errorAlert").classList.contains("visually-hidden")){
        document.getElementById("errorAlert").classList.add("visually-hidden")
        document.getElementById("errorAlert").innerHTML = ""
    }

    // Recupero le informazioni per il login
    var email = document.getElementById("login_email").value
    var password = document.getElementById("login_password").value

    // Creo il JSON
    var user = {
        email: email,
        password: password
    }

    // Tento il login
    var res = await userLogin(user)
    console.log(res)
    if (!res.status) {
        // Imposto le variabili nel local storage e cambio pagina a quella precedente
        localStorage.setItem("user", res.loggedUser._id)
        localStorage.setItem("nickname", res.loggedUser.nickname)
        window.location.href = document.referrer
    } else {
        // Mostro l'alert di errore
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

// TRACKS FUNCTIONS

/**
 * Funzione che stampa le track migliori in Italia
 */
export async function printTopCharts() {
    var playlist = await getTopCharts()
    if(playlist.error){
        alert(playlist.error.status)
        return
    }
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
        page.addEventListener("click", changePagination)
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
        clone.getElementsByClassName("card-img")[0].classList.add("cursor")
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
    // Titolo della canzone
    var title = document.createElement("h3")
    title.innerHTML = "Titolo: " + info.name
    node.append(title)

    // Divido la pagina in una parte sinistra e destra
    var left = document.createElement("div")
    left.classList.add("col-4", "col-sm-12", "col-md-4",)
    var img = document.createElement("img")
    img.style="width:100%"
    img.src = info.album.images[0].url
    left.append(img)
    var right = document.createElement("ul")
    right.classList.add("col-8","col-sm-12", "col-md-7", "list-group")

    // Elenco degli artisti
    var li = document.createElement("li")
    li.classList.add("list-group-item")
    li.innerHTML="Artisti: "
    for (let i=0; i<info.artists.length; i++){
        var a = document.createElement("a")
        a.addEventListener("click", function(){goToArtist(info.artists[i].id)})
        a.classList.add("link", "cursor")
        a.innerHTML = info.artists[i].name 
        li.append(a)
        i+1<info.artists.length ? li.append(document.createElement("div").innerHTML=" e ") : null
    }
    right.append(li)

    // Album a cui appartiene la canzone
    var li = document.createElement("li")
    li.classList.add("list-group-item")
    li.innerHTML = "Album: "
    var a = document.createElement("a")
    a.innerHTML = info.album.name
    a.addEventListener("click", function(){goToAlbum(info.album.id)})
    a.classList.add("link", "cursor")
    li.append(a)
    right.append(li)

    // Durata della canzone
    li = document.createElement("li")
    li.classList.add("list-group-item")
    li.innerHTML = "Durata: " + msToMinutesAndSeconds(info.duration_ms)
    right.append(li)

    // Preview della canzone
    if (info.preview_url!=null){
        var li = document.createElement("li")
        li.classList.add("list-group-item")
        li.innerHTML = "Preview: </br>"
        li.style="vertical-align: middle;"
        var audio = document.createElement("audio")
        audio.controls="controls"
        var source = document.createElement("source")
        source.src = info.preview_url
        source.type = "audio/mpeg"
        audio.append(source)
        audio.style="width:100%;"
        li.append(audio)
        right.append(li)
    }
    if (logged()){
        var li = document.createElement("li")
        li.classList.add("list-group-item")
        // Possibilità di aggiungere la canzone ad una playlist
        var div = document.createElement("div")
        div.classList.add("row")
        var divselect = document.createElement("div")
        divselect.classList.add("col-5")
        var select = document.createElement("select")
        select.id = "myplaylist"
        select.classList.add("form-select")
        select.style = "margin-top:30px"
        var option = document.createElement("option")
        option.innerHTML = "Seleziona una tua playlist"
        select.append(option)
        // Recupero le playlist dell'utente
        var myplaylist = await getMyPlaylist(window.localStorage.getItem("user"))
        console.log(myplaylist)
        for (let i=0;i<myplaylist.length;i++){
            option = document.createElement("option")
            option.innerHTML = myplaylist[i].name
            option.value = myplaylist[i]._id
            option.classList.add("playlistToAdd")
            select.append(option)
        }
        divselect.append(select)
        div.append(divselect)
        
        li.append(div)
        // Creo il bottone per aggiungere la canzone alla playlist
        var divbutton = document.createElement("div")
        divbutton.classList.add("col-7")
        var button = document.createElement("button")
        button.innerHTML="Aggiungi a una tua playlist"
        button.id = window.location.href.split("?")[1]
        button.addEventListener("click", addTrackToPlaylist)
        button.classList.add("btn","show", "btn-primary")
        divbutton.append(button)
        div.append(divbutton)
        right.append(li)
    }

    node.append(left)
    node.append(right)
    document.getElementById(idNode).append(node)

    printTopTrackArtist(info.artists[0].id, idTemplate)
}

// ARTISTS FUNCTIONS

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
    // Recupero le informazioni dell'artista
    var artist = await getArtist(idArtist)
    if(artist.error){
        alert(artist.error.message)
        return
    }
    console.log(artist)
    var node = document.createElement("div")
    node.classList.add("row", "justify-content-center")
    // Nome dell'artista
    var title = document.createElement("h3")
    title.innerHTML = "Artista: " + artist.name
    node.append(title)
    // Divisione in due sezioni della pagina, a sinistra la foto dell'artista e a destra le informazioni
    var left = document.createElement("div")
    left.classList.add("col-4", "col-sm-12", "col-md-4",)
    var img = document.createElement("img")
    img.style="width:100%"
    img.src = artist.images[0].url
    left.append(img)
    var right = document.createElement("ul")
    right.classList.add("col-8","col-sm-12", "col-md-7", "list-group")
    // Generi associato all'artista
    var li = document.createElement("li")
    li.classList.add("list-group-item", )
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
    // Numero di follower dell'artista su Spotify
    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Follower: "
    var a = document.createElement("a")
    a.innerHTML = artist.followers.total.toLocaleString('en-US')
    li_clone.append(a)
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
    for (let i=0; i<artists.length; i+=5){ // Divisione per row da 5 card
        var page = document.createElement("li")
        page.classList.add("page-item", "page-link", "link")
        page.style = "cursor: pointer"
        page.innerHTML = (i/5) +1
        page.addEventListener("click", changePagination)
        pagination.append(page)

        // Create new row
        var row = document.createElement("div")
        row.classList.add("row", "justify-content-center")
        i/5 == 0 ? null : row.classList.add("visually-hidden")
        var newid = idNode+"Row" + (i/5)
        row.id= newid
        node.append(row)

        printArtistsCard(artists.slice(i,i+5), template, newid, i+1)
    }
    if(artists.length>5){ // Attivo la prima pagina
        pagination.childNodes[0].classList.add("active")
        node.append(pagination)
    }
}

// ALBUM FUNCTIONS

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
        clone.getElementsByClassName("card-img")[0].classList.add("cursor")
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
    if(onlyalbum.length==0){return} // SE non ci sono album, non stampo niente

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
    node.innerHTML=""
    // Clono il template
    var template = document.getElementById(idTemplate).cloneNode(true)
    template.classList.remove("visually-hidden")
    var pagination = document.createElement("ul")
    pagination.classList.add("pagination", "justify-content-center")
    for (let i=0; i<albums.length; i+=5){
        // Create new page
        var page = document.createElement("li")
        page.classList.add("page-item", "page-link", "link")
        page.style = "cursor: pointer"
        page.innerHTML = (i/5)+1
        page.addEventListener("click", changePagination)
        pagination.append(page)

        // Create the row
        var row = document.createElement("div")
        row.classList.add("row", "justify-content-center")
        i/5 == 0 ? null : row.classList.add("visually-hidden")
        var newid = idNode+"Row" + (i/5)
        row.id= newid
        node.append(row)

        printAlbumsCard(albums.slice(i,i+5), template, newid, i+1)
    }
    if(albums.length>5){ // Attivo la prima pagina
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
        clone.getElementsByClassName("card-img")[0].classList.add("cursor")
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
    // Recupero le informazioni dell'album
    var album = await getAlbum(idAlbum)
    if(album.error){
        alert(album.error.message)
        return
    }
    console.log(album)
    // Titolo dell'album
    var node = document.createElement("div")
    node.classList.add("row", "justify-content-center")
    var title = document.createElement("h3")
    title.innerHTML = "Album: " + album.name
    node.append(title)
    // Divisione in due sezioni della pagina, a sinistra la foto dell'album e a destra le informazioni
    var left = document.createElement("div")
    left.classList.add("col-4", "col-sm-12", "col-md-4",)
    var img = document.createElement("img")
    img.style="width:100%"
    img.src = album.images[0].url
    left.append(img)
    var right = document.createElement("ul")
    right.classList.add("col-8","col-sm-12", "col-md-7", "list-group")
    
    // Creo il template di un item dell'elenco 
    var li = document.createElement("li")
    li.classList.add("list-group-item")
    
    // Nomi degli autori
    var li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Autori: "  
    var a = document.createElement("a")
    a.innerHTML = album.artists[0].name
    a.addEventListener("click", function(){goToArtist(album.artists[0].id)})
    a.classList.add("link", "cursor")
    li_clone.append(a)
    right.append(li_clone)
    
    // Elenco generi (SE specificati)
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

    // Numero di traccie all'interno
    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Numero di traccie: " + album.total_tracks
    right.append(li_clone)

    // Data di uscita
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
    tracklist.classList.add("container", "list-group")
    tracklist.id = "trackList"

    // Creo il template degli elementi della lista
    var template = document.createElement("li")
    template.classList.add("list-group-item")
    var row = document.createElement("div")
    row.classList.add("row")
    var col = document.createElement("div")
    col.classList.add("col")
    row.append(col, col.cloneNode(true))
    template.append(row, row.cloneNode(true))
    
    // SE l'utente è loggato, recupero le sue playlist (senza recuperarle per ogni canzone)
    var myplaylist
    if(logged()){myplaylist = await getMyPlaylist(window.localStorage.getItem("user"))}

    document.getElementById("albumTrack").append(tracklist)
    console.log(tracks)
    for(let i=0;i<tracks.length;i++){
        printTrackItemList(tracks[i], "trackList", template, myplaylist, false, i+1)
    }

    var title = document.createElement("h4")
    title.innerHTML = "Tracklist dell'album"
    document.getElementById("albumTrack").prepend(title)
    document.getElementById("albumPlaceholder").remove()
}

// PLAYLIST FUNCTIONS

/**
 * Funzione che stampa le playlist dell'utente
 * @param {String} idNode id dove accodare le playlist 
 * @param {String} idTemplate id dove reperire il template da utilizzare
 */
export async function printMyPlaylists(idNode, idTemplate){
    if (!logged()){return} // SE l'utente non è loggato
    var user = localStorage.getItem("user")
    var node = document.getElementById(idNode)
    for(let i=0;i<5;i++){ // Print di 5 card placeholder mentre recupero le info
        printCardPlaceholder(idNode)
    }

    // Recupero le playlist dell'utente
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
        // Titolo
        var title = document.createElement("h4")
        title.innerHTML = "Le tue playlist"
        node.innerHTML = ""
        printContentRows(playlists, idNode, idTemplate, printPlaylistCard)
        node.parentNode.prepend(title)
    }
}

/**
 * Funzione che predispone paginazione e righe per un contenuto da stampare
 * @param {Array} content array contenente le informazioni da stampare
 * @param {String} idNode id del nodo a cui accodare le informazioni
 * @param {String} idTemplate id del template da clonare
 * @param {Function} printFunction funzione da utilizzare per stampare i singoli elementi
 */
export function printContentRows(content, idNode, idTemplate, printFunction){
    var node = document.getElementById(idNode)
    // Clono il template
    var template = document.getElementById(idTemplate).cloneNode(true)
    template.classList.remove("visually-hidden")

    // Creo la paginazione
    var pagination = document.createElement("ul")
    pagination.classList.add("pagination", "justify-content-center")
    for (let i=0;i<content.length;i+=5){ // stampo 5 playlist per ogni riga
        var row = document.createElement("div")
        row.classList.add("row", "justify-content-center")
        i/5 == 0 ? null : row.classList.add("visually-hidden")
        var newid = idNode+(i/5)
        row.id = newid
        node.append(row)
        
        printFunction(content.slice(i,i+5), newid, idTemplate)

        // Aggiungo un nuovo elemento alla paginazione
        var page = document.createElement("li")
        page.classList.add("page-item", "page-link", "link")
        page.style = "cursor: pointer"
        page.innerHTML = (i/5) +1
        page.addEventListener("click", changePagination)
        pagination.append(page)
    }
    if(content.length>5){ // Attivo la prima pagina
        pagination.childNodes[0].classList.add("active")
        document.getElementById(idNode).append(pagination)
    }
}

/**
 * Funzione che stampa le playlist 5 playlist per riga
 * @param {Array} playlists array contenente le playlist
 * @param {String} idNode id dove accodare le playlist 
 * @param {String} idTemplate template da utilizzare
 */
export function printPlaylistCard(playlists, idNode, idTemplate){
    // Recupero il nodo del template e il nodo dove accodare le playlist
    var node = document.getElementById(idNode)
    var template = document.getElementById(idTemplate)
    template.classList.remove("visually-hidden")
    for(let i=0;i<playlists.length;i++){
        var div = template.cloneNode(true)
        div.id=""
        div.getElementsByClassName("card-img")[0].src = "../img/music.jpg"
        div.classList.add(playlists[i]._id)

        // Imposto come immagine della playlist, quella della prima canzone SE c è
        if(playlists[i].tracks && playlists[i].tracks.length!=0){
            if (playlists[i].tracks[0].album.images[0].url){
                div.getElementsByClassName("card-img")[0].src = playlists[i].tracks[0].album.images[0].url
            }
        }
        div.getElementsByClassName("card-img")[0].addEventListener("click", function(){goToPlaylist(playlists[i]._id)})
        div.getElementsByClassName("card-img")[0].classList.add("cursor")
        div.getElementsByClassName("nome_playlist")[0].innerHTML = playlists[i].name
        div.getElementsByClassName("nome_playlist")[0].addEventListener("click", function(){goToPlaylist(playlists[i]._id)})
        div.getElementsByClassName("nome_playlist")[0].classList.add("link", "cursor")

        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

        if(!logged()){
            //niente
        }else if(playlists[i].owner==window.localStorage.getItem("user")){ 
            // SE l'utente è il proprietario della playlist, aggiungo la ❌ per cancellare la playlist
            var del = document.createElement('div')
            del.classList.add("card-action", "cursor")
            del.innerHTML = "❌"
            del.value = playlists[i]._id
            del.setAttribute("data-bs-toggle","popover")
            del.setAttribute("data-bs-trigger","hover focus")
            del.setAttribute("data-bs-content","Cancella playlist")
            del.setAttribute("data-bs-placement", "bottom")
            del.addEventListener("click", deleteThisPlaylist)
            div.getElementsByClassName("nome_playlist")[0].parentNode.append(del)
        }else{
            // Essendo loggato, controllo SE l'utente segue già la playlist
            var found=false
            for(let k=0;k<playlists[i].followers.length;k++){
                if(window.localStorage.getItem("user") == playlists[i].followers[k].id){
                    // SE segue la playlist, aggiungo la ❌ per smettere di seguire la playlist
                    var del = document.createElement("div")
                    del.classList.add("card-action", "cursor")
                    del.innerHTML = "❌"
                    del.value = playlists[i]._id
                    del.setAttribute("data-bs-toggle","popover")
                    del.setAttribute("data-bs-trigger","hover focus")
                    del.setAttribute("data-bs-content","Unfollow")
                    del.setAttribute("data-bs-placement", "bottom")
                    del.addEventListener("click", handleFollow)
                    div.getElementsByClassName("nome_playlist")[0].parentNode.append(del)
                    found = true
                    break
                }
            }
            if(!found){
                // SE non segue la playlist, aggiungo il ➕ per iniziare a seguire la playlist
                var agg = document.createElement("div")
                agg.classList.add("card-action", "cursor")
                agg.innerHTML = "➕"
                agg.value = playlists[i]._id
                agg.setAttribute("data-bs-toggle","popover")
                agg.setAttribute("data-bs-trigger","hover focus")
                agg.setAttribute("data-bs-content","Follow")
                agg.setAttribute("data-bs-placement", "bottom")
                agg.addEventListener("click", handleFollow)
                div.getElementsByClassName("nome_playlist")[0].parentNode.append(agg)
            }
        }
        node.append(div)
    }
    template.classList.add("visually-hidden")
}

/**
 * Funzione che, in base all'INNER HTML del nodo, aggiunge o toglie il follow dell'utente alla playlist il cui id è il value del nodo
 */
async function handleFollow(){
    if(this.innerHTML == "❌"){
        await removeFollow(this.value, {"id" : window.localStorage.getItem("user")});
        this.innerHTML = "➕"
    }else if(this.innerHTML == "➕"){
        await addFollow(this.value, {"id" : window.localStorage.getItem("user")});
        this.innerHTML = "❌"
    }
}

/**
 * Funzione che elimina la playlist dato il suo id nel nodo attuale
 */
async function deleteThisPlaylist(){
    var id = this.value
    var res = await deletePlaylist(id)
    if(res.acknowledged){
        while(true){
            let card = document.getElementsByClassName(id)
            if(card[0]==undefined){break}
            card[0].remove()
        }
    }
}

/**
 * Funzione che stampa le informazioni di una playlist e le sue track
 * @param {String} id id della playlist
 * @param {String} idNode id del nodo in cui stampare le informazioni
 */
export async function printPlaylistInfo(id, idNode){
    // Recupero le informazioni della playlist
    var playlist = await getPlaylist(id)
    if(playlist==undefined){window.location.href = "/src/playlist.html";return;}
    console.log(playlist)

    var node = document.createElement("div")
    node.classList.add("row", "justify-content-center")
    node.style = "margin-top:20px"
    var loggedUser = window.localStorage.getItem("user")
    var isowner = loggedUser && playlist.owner == loggedUser

    // Divisione in due sezioni della pagina, a sinistra la foto della playlist e a destra le informazioni
    var left = document.createElement("div")
    left.classList.add("col-4", "col-sm-12", "col-md-4",)
    var img = document.createElement("img")
    img.style="width:100%"
    if(playlist.tracks && playlist.tracks.length!=0){
        img.src = playlist.tracks[0].album.images[0].url
    }else{
        img.src = "../img/music.jpg"
    }
    left.append(img)
    
    var right = document.createElement("ul")
    right.classList.add("col-8","col-sm-12", "col-md-7", "list-group")
    
    // Creo il template per gli elementi della lista
    var li = document.createElement("li")
    li.classList.add("list-group-item")
    
    // Nome della playlist
    var li_clone = li.cloneNode(true)
    if(isowner){
        var title = document.createElement("div")
        title.innerHTML = "Playlist: "
        title.classList.add("col-2")
        title.style = "margin-top:8px"
        li_clone.classList.add("container")
        var row = document.createElement("div")
        row.classList.add("row")
        var form = document.createElement("div")
        form.classList.add("col-10")
        var div = document.createElement("div")
        div.classList.add("row")

        // Input per modificare il nome della playlist
        var divInput = document.createElement("div")
        divInput.classList.add("col-6")
        var input = document.createElement("input")
        input.classList.add("form-control")
        input.value = playlist.name
        input.autocomplete = "off"
        input.id="name"
        divInput.append(input)
        
        // Bottone per modificare il nome della playlist
        var divButton = document.createElement("div")
        divButton.classList.add("col-6")
        var button = document.createElement("button")
        button.innerHTML = "Aggiorna nome"
        button.classList.add("btn", "btn-primary")
        button.style = "width:100%"
        button.addEventListener("click", async function (){
            var res = await putNamePlaylist(playlist._id, document.getElementById("name").value)
            console.log(res)
            if(res.acknowledged){
                showSuccessAlert("Nome della playlist modificato correttamente") 
            }else{
                showErrorAlert(res.status, res.text)
            }
        })
        divButton.append(button)


        div.append(divInput, divButton)
        form.append(div)
        row.append(title, form)
        li_clone.append(row)
    }else{
        li_clone.innerHTML = "Playlist: " + playlist.name
    }
    right.append(li_clone)

    // Proprietario della playlist
    var li_clone = li.cloneNode(true)
    var autore = ""
    if(isowner){
        autore="Tu"
    }else{
        autore = await getUser(playlist.owner)
        autore = autore.nickname
    }
    li_clone.innerHTML = "Autore: "  + autore
    right.append(li_clone)

    // Descrizione
    li_clone = li.cloneNode(true)
    if(isowner){
        var title = document.createElement("div")
        title.innerHTML = "Descrizione: "
        title.classList.add("col-2")
        title.style = "margin-top:8px"
        li_clone.classList.add("container")
        var row = document.createElement("div")
        row.classList.add("row")
        var form = document.createElement("div")
        form.classList.add("col-10")
        var div = document.createElement("div")
        div.classList.add("row")

        // Input per modificare la descrizione della playlist
        var divInput = document.createElement("div")
        divInput.classList.add("col-6")
        var input = document.createElement("input")
        input.classList.add("form-control")
        input.autocomplete = "off"
        input.id="description"
        if(playlist.description==""){
            input.placeholder = "nessuna"
        }else{
            input.value = playlist.description
        }
        divInput.append(input)

        // Bottone per modificare la descrizione della playlist
        var divButton = document.createElement("div")
        divButton.classList.add("col-6")
        var button = document.createElement("button")
        button.innerHTML = "Aggiorna descrizione"
        button.classList.add("btn", "btn-primary")
        button.style = "width:100%"
        button.addEventListener("click", async function (){
            var res = await putDescriptionPlaylist(playlist._id, document.getElementById("description").value)
            console.log(res)
            if(res.acknowledged){
                showSuccessAlert("Descrizione modificata correttamente")
            }else{
                showErrorAlert(res.status, res.error)
            }
        })
        divButton.append(button)
        div.append(divInput, divButton)
        form.append(div)
        row.append(title, form)
        li_clone.append(row)
    }else{
        li_clone.innerHTML = "Descrizione: " + (!playlist.description || playlist.description=="" ? "nessuna" : playlist.description)
    }
    right.append(li_clone)
    
    // Numero dei follower
    li_clone = li.cloneNode(true)
    li_clone.innerHTML = "Numero follower: " + playlist.followers.length
    right.append(li_clone)
    
    // Gestione dei tag della playlist
    li_clone = li.cloneNode(true)
    li_clone.classList.add("container")
    var row = document.createElement("div")
    row.classList.add("row")
    var div = document.createElement("div")
    div.innerHTML = "Tag:"
    div.classList.add("col-1")
    row.append(div)

    // Creo l'elenco dei tag
    var taglist = document.createElement("div")
    taglist.id = "tagList"
    taglist.classList.add("row", "col-11")
    if(playlist.tags.length==0){
        // Nessun tag
        div = document.createElement("div")
        div.id= "nessuno"
        div.innerHTML = "Nessuno"
        taglist.append(div)
    }else{
        for(let i=0;i<playlist.tags.length;i++){
            var divtag = document.createElement("div")
            divtag.classList.add("col-auto", "tag")
            if(isowner){
                // SE l'utente è il proprietario della playlist, aggiungo la ❌ per poter eliminare il tag dalla playlist
                var a = document.createElement("a")
                a.innerHTML = "❌ "
                a.style = "cursor: pointer; text-decoration: none;"
                a.classList.add("link")
                a.addEventListener("click", removeTag)
                divtag.append(a)
            }
            // Nome del tag
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
        // SE l'utente è il proprietario della playlist, aggiungo la possibilita di aggiungere nuovi tag alla playlist
        row = document.createElement("div")
        row.classList.add("row")
        row.style = "margin-top:10px"

        // Input nuovi tag
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

        // Bottone per aggiungere il nuovo tag all'elenco
        div = document.createElement("div")
        div.classList.add("col-auto")
        button = document.createElement("button")
        button.classList.add("btn", "btn-primary")
        button.innerHTML="Aggiungi tag"
        button.addEventListener("click", addTag)
        div.append(button)
        row.append(div)
        li_clone.append(row)

        // Bottone per aggiornare i tag della playlist nel db
        button = document.createElement("button")
        button.classList.add("btn", "btn-primary")
        button.innerHTML="Aggiorna i tag della playlist"
        button.style = "width:100%;margin-top:10px"
        button.value = playlist._id
        button.addEventListener("click", updateTag)
        li_clone.append(button)
    }
    right.append(li_clone)

    // Visibilita della playlist
    li_clone = li.cloneNode(true)
    var div = document.createElement("div")
    div.id = "public"
    div.innerHTML = (playlist.public ? "Playlist pubblica" : "Playlist privata")
    li_clone.append(div)

    if(loggedUser){
        // SE l'utente è loggato sono disponibili delle azioni
        div = document.createElement("div")
        div.classList.add("text-center")
        var button = document.createElement("button")
        button.classList.add("show", "btn-primary", "btn")
        button.value = playlist._id
        if(isowner){
            // SE è il proprietario della playlist, aggiungo un bottone per cambiare la visibilità della playlist
            if(playlist.public){
                button.innerHTML = "Rendi privata"
            }else{
                button.innerHTML = "Rendi pubblica"
            }
            button.addEventListener("click", handlePlaylist)
            div.append(button)

            // Aggiungo un bottone per cancellare la playlist
            button = document.createElement("button")
            button.classList.add("show", "btn-danger", "btn")
            button.value = playlist._id
            button.innerHTML = "Cancella la playlist"
            button.addEventListener("click", async function(){
                var res = await deletePlaylist(playlist._id);
                this.remove()
                window.location.href = "/src/playlist.html"
            })
        }else{
            // SE l'utente non è il proprietario, aggiungo un bottone per seguire/smettere di seguire la playlist
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

    printPlaylistTracks(playlist.tracks, "trackPlaylist", isowner)

    if(isowner){ // SOLO SE l'utente è il proprietario della playlist, aggiungo le canzoni suggerite 
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
            var res = await addFollow(this.value, {"id":user})
            if(res.acknowledged){
                showSuccessAlert("Playlist seguita correttamente")
                this.innerHTML = "Unfollow"
            }
            break;
        case "Unfollow":
            var res = await removeFollow(this.value, {"id":user})
            if(res.acknowledged){
                showSuccessAlert("Rimozione follow seguita correttamente")
                this.innerHTML = "Follow"
            }
            break;
        case "Rendi pubblica":
            var res = await changePlaylistVisibility(this.value, true)
            if(res.acknowledged){
                this.innerHTML = "Rendi privata"
                var visibility = document.getElementById("public")
                visibility.innerHTML = "Playlist pubblica"
                showSuccessAlert("Playlist resa pubblica correttamente")
            }
            break;
        case "Rendi privata":
            var res = await changePlaylistVisibility(this.value, false)
            if(res.acknowledged){
                this.innerHTML = "Rendi pubblica"
                var visibility = document.getElementById("public")
                visibility.innerHTML = "Playlist privata"
                showSuccessAlert("Playlist resa privata correttamente")
            }
            break;
    }
}

/**
 * Funzione che nasconde gli oggetti con id errorAlert e successAlert
*/
function hideAlerts(){
    if(!document.getElementById("errorAlert").classList.contains("visually-hidden")){
        document.getElementById("errorAlert").classList.add("visually-hidden")
    }
    if(!document.getElementById("successAlert").classList.contains("visually-hidden")){
        document.getElementById("successAlert").classList.add("visually-hidden")
    }
}

/**
 * Funzione che mostra in errorAlert l'errore che si è verificato
 * @param {int} errorStatus codice di errore
 * @param {String} message messaggio di errore
 */
function showErrorAlert(errorStatus, message){
    hideAlerts()
    document.getElementById("errorAlert").classList.remove("visually-hidden")
    document.getElementById("errorAlert").innerHTML = errorStatus + ": " + message
}

/**
 * Funzione che mostra in successAlert il messaggio di successo
 * @param {String} message messaggio di conferma della corretta esecuzione
 */
function showSuccessAlert(message){
    hideAlerts()
    document.getElementById("successAlert").classList.remove("visually-hidden")
    document.getElementById("successAlert").innerHTML = message
}

/**
 * Funzione che stampa le tracks nel nodo specificato
 * @param {Array} tracks array di canzoni da stampare
 * @param {String} idNode id del nodo a cui accodare le canzoni della playlist
 * @param {boolean} isowner
 */
export async function printPlaylistTracks(tracks, idNode, isowner){
    var node = document.getElementById(idNode)
    node.innerHTML = ""
    var title = document.createElement("h4")
    var tracklist = document.createElement("ul")
        tracklist.classList.add("container", "list-group")
        tracklist.id="trackList"
    if(tracks.length==0){
        title.innerHTML = "Nessuna canzone nella playlist"
        node.append(title)
        node.append(tracklist)
    }else{
        // Creo il template degli elementi della lista
        var template = document.createElement("li")
        template.classList.add("list-group-item")
        var row = document.createElement("div")
        row.classList.add("row")
        var col = document.createElement("div")
        col.classList.add("col")
        row.append(col, col.cloneNode(true))
        template.append(row, row.cloneNode(true))
        
        var myplaylist // Recupero le playlist dell'utente se loggato
        if(logged()){
            myplaylist = await getMyPlaylist(window.localStorage.getItem("user"))
        }

        document.getElementById(idNode).append(tracklist)

        for(let i=0;i<tracks.length;i++){
            printTrackItemList(tracks[i], tracklist.id, template, myplaylist, isowner, i+1)
        }

        var title = document.createElement("h4")
        title.innerHTML = "Tracklist della playlist"
        document.getElementById(idNode).prepend(title)
    }
}

/**
 * Funzione che stampa una canzone di una tracklist
 * @param {*} track informazioni della canzone
 * @param {String} idNode id del nodo a cui accodare le informazioni
 * @param {Node} template template da utilizzare 
 * @param {Array} myplaylist array contenente le playlist dell'utente
 * @param {boolean} isowner SE l'utente è anche proprietario della playlist
 * @param {int} count numero della canzone all'interno della tracklist
 */
export function printTrackItemList(track, idNode, template, myplaylist, isowner, count){
    // Clono il template
    var clone = template.cloneNode(true)
    clone.childNodes[0].childNodes[0].innerHTML = "#" + count + " "
    
    // Titolo della canzone
    var a = document.createElement("a")
    a.innerHTML = track.name
    a.addEventListener("click", function(){goToTrack(track.id)})
    a.classList.add("link", "cursor")
    clone.childNodes[0].childNodes[0].append(a)
    
    // Preview della canzone
    if(track.preview_url!=null){
        // la preview per alcuna track non è disponibile
        var audio = document.createElement("audio")
        audio.style = "width:100%"
        audio.controls="controls"
        var source = document.createElement("source")
        source.src = track.preview_url
        source.type = "audio/mpeg"
        audio.append(source)
        clone.childNodes[0].childNodes[1].append(audio)
    }else{
        clone.childNodes[1].style = "margin-top:10px"
    }

    if(logged()){
        // Bottone di aggiungere la canzone ad una playlist
        clone.childNodes[1].childNodes[0].classList.add("text-center")
        clone.childNodes[1].childNodes[1].classList.add("text-center")
        var button = document.createElement("button")
        button.id=track.id
        button.innerHTML="Aggiungi in una tua playlist"
        button.addEventListener("click", addTrackToPlaylistFromSelect)
        button.classList.add("btn", "btn-primary", "show")
        button.style = "margin:0;"
        clone.childNodes[1].childNodes[0].append(button)

        // Lista contenente le playlist dell'utente
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

    if(isowner){
        // SE l'utente è il proprietario della playlist, puo rimuovere una canzone da essa con un bottone
        var rowdel = document.createElement("div")
        rowdel.classList.add("text-center")
        var del = document.createElement("button")
        del.innerHTML = "Rimuovi canzone dalla playlist"
        del.classList.add("btn", "btn-danger", "show")
        del.value = track.id + ";" + window.location.href.split("?")[1]
        del.addEventListener("click", removeTrackFromPlaylist)
        rowdel.append(del)
        clone.append(rowdel)
    }
    document.getElementById(idNode).append(clone)
}

/**
 * Funzione che aggiunge una canzone alla playlist selezionata da una select 
 * e poi la playlist viene rimossa dalla select 
 */
export async function addTrackToPlaylistFromSelect(){
    var id = this.id
    var track = await getTrack(id)
    if(track.error){
        alert(track.error.message)
        return
    }
    var select = this.parentNode.parentNode.childNodes[1].childNodes[0]
    var playlist = select.value
    if(playlist=="Seleziona una tua playlist"){return}
    console.log((track))
    var res = await putPlaylist(playlist, track)
    console.log(res)
    if(res.acknowledged){
        showSuccessAlert("Canzone aggiunta alla playlist")
        for(let i=0;i<select.childNodes.length;i++){
            if(select.childNodes[i].value==playlist){
                select.childNodes[i].remove()
                break
            }
        }
    }else{
        showErrorAlert(res.status, res.text)
    }
}

/**
 * Funzione usata per aggiungere una canzone dalla sua card alla playlist corrente 
 */
export async function addTrackToPlaylist(){
    var id = this.id
    var track = await getTrack(id)
    if(track.error){
        alert(track.error.message)
        return
    }
    var playlist = this.parentNode.parentNode.childNodes[0].childNodes[0].value
    if(playlist == "Seleziona una tua playlist"){return}
    console.log((track))
    var res = await putPlaylist(playlist, track)
    console.log(res)
    if(res.acknowledged){
        showSuccessAlert("Canzone aggiunta correttamente alla playlist")
    }else{
        showErrorAlert(res.status, res.text)
    }
}

/**
 * Funzione che rimuove la canzone dalla playlist attuale
 */
export async function removeTrackFromPlaylist(){
    var idTrack = this.value.split(";")[0]
    var idPlaylist = this.value.split(";")[1]
    var res = await removeTrack(idPlaylist, {"id":idTrack})
    console.log(res)
    if(res.acknowledged){
        this.parentNode.parentNode.remove()
        var tracks = document.getElementById("trackList").childNodes
        if (tracks.length==0){
            document.getElementById("trackList").parentNode.childNodes[0].innerHTML = "Nessuna canzone nella playlist"
        }else{
            // Il numero d'ordine dell'elenco delle canzoni potrebbe non essere piu corretto quindi lo resetto
            for(let i=0;i<tracks.length;i++){
                var a = tracks[i].childNodes[0].childNodes[0].childNodes[1]
                tracks[i].childNodes[0].childNodes[0].innerHTML = "#"+(i+1)+" "
                tracks[i].childNodes[0].childNodes[0].append(a)
            }
        }
        showSuccessAlert("Canzone rimossa dalla playlist correttamente")
    }else{
        showErrorAlert(res.status, res.text)
    }
}
/**
 * Funzione che stampa i suggerimenti per un utente
 */
export async function printRecomandations(id){
    var iduser = window.localStorage.getItem("user")
    if(!iduser){return}
    var user = await getUser(iduser) // Recupero le informazioni dell'utente

    // Creo una stringa comma-separated per i generi preferiti
    var genres = user.favorite_genres[0].name
    for(let i=1;i<user.favorite_genres.length;i++){
        genres += ", " +  user.favorite_genres[i].name
    }

    // Recupero le canzoni consigliate da spotify dati i generi preferiti dell'utente
    var res = await getRecommendations(genres)
    if(res.error){
        alert(res.error.message)
        return
    }
    var recommendations = res.tracks
    console.log(recommendations)
    
    printPlaylist(recommendations, "recommendations", "track-template")
    
    var title = document.createElement("h4")
    title.innerHTML = "Suggerimenti"
    document.getElementById("recommendations").prepend(title)

    // Ad ogni card aggiungo un ➕ per aggiungere la canzone alla playlist corrente
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

/**
 * Funzione che richiama la funzione backend che aggiunge una track a una playlist
 */
export async function addTrackToThisPlaylist(){
    // Recupero gli id necessari
    var idPlaylist = this.value.split(";")[0]
    var idTrack = this.value.split(";")[1]
    var track = await getTrack(idTrack)
    if(track.error){
        alert(track.error.message)
        return
    }

    // Aggiorno la playlist aggiungendo la canzone
    var res = await putPlaylist(idPlaylist, track)
    console.log(res)
    if(res.acknowledged){
        // Recupero le playlist dell'utente da aggiungere alla select
        var myplaylist = await getMyPlaylist(window.localStorage.getItem("user"))

        var tracklist = document.getElementById("trackList")
        if(tracklist.childNodes.length==0){
            tracklist.parentNode.childNodes[0].innerHTML = "Tracklist della playlist"
        }
        var clone = document.createElement("li")
        clone.classList.add("list-group-item")
        var row = document.createElement("div")
        row.classList.add("row")
        var col = document.createElement("div")
        col.classList.add("col")
        row.append(col, col.cloneNode(true))
        clone.append(row, row.cloneNode(true))

        printTrackItemList(track, "trackList", clone, myplaylist, true, tracklist.childNodes.length+1)
    
        showSuccessAlert("Canzone aggiunta alla playlist correttamente")
    }else{
        showErrorAlert(res.status, res.text)
    }
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
    for(let i=0;i<5;i++){ // Print di 5 card placeholder mentre recupero le info
        printCardPlaceholder("followedPlaylists")
    }
    
    // Recupero le playlist che segue l'utente
    var followedPlaylists = await getFollowedPlaylists(user)
    console.log(followedPlaylists)
    if(followedPlaylists.length==0){
        document.getElementById("followedPlaylists").innerHTML = ""
        title.innerHTML = "Non segui ancora nessuna playlist"
    }else{
        document.getElementById("followedPlaylists").innerHTML = ""
        printContentRows(followedPlaylists, "followedPlaylists", "playlist-template", printPlaylistCard)
    }
    document.getElementById("followedPlaylists").parentNode.prepend(title)
}

/**
 * Funzione che stampa le playlist pubbliche
 */
export async function printPublicPlaylists(){
    var node = document.getElementById("publicPlaylists")

    // Recupero tutte le playlist pubbliche
    var playlists = await getPublicPlaylist()
    console.log(playlists)
    var title = document.createElement("h4")
    if(playlists.length == 0){
        title.innerHTML = "Oh no, non ci sono ancora playlist pubbliche"
    }else{
        printContentRows(playlists, "publicPlaylists", "playlist-template", printPlaylistCard)
        title.innerHTML = "Esplora le playlist pubbliche"
    }
    node.parentNode.prepend(title)
}

/**
 * Funzione che crea una nuova playlist 
 */
export async function addPlaylist(){
    // Recupero le informazioni della nuova playlist
    var nome = document.getElementById("nome").value
    var owner = window.localStorage.getItem("user")
    var publics = document.getElementById("public").checked
    var description = document.getElementById("descrizione").value
    var tracks = []
    var tags = []
    var followers = []
    var tagsNode = document.getElementsByClassName("tagSpan")

    // Nascondo eventuali alert di errori precedenti
    if(!document.getElementById("errorAlert").classList.contains("visually-hidden")){
        document.getElementById("errorAlert").classList.add("visually-hidden")
        document.getElementById("errorText").innerHTML = ""
    }
    if(tags){
        Array.prototype.forEach.call(tagsNode, function(tag) {
            tags.push({"name" : tag.innerHTML})
        });
    }

    // Creo il JSON
    var playlist = {
        name: nome,
        owner: owner,
        tracks: tracks,
        public: publics,
        description: description,
        tags: tags,
        followers: followers
    }

    // Aggiungo la nuova playlist
    var res = await postPlaylist(playlist)
    console.log(res)
    if(res.text){
        // Mostro l'alert di errore con il messaggio
        document.getElementById("errorAlert").classList.remove("visually-hidden")
        document.getElementById("errorText").innerHTML = res.status + ": " + res.text
    }else{
        // Vado alla pagina della nuova playlist
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
        // Controllo che il nuovo tag non sia già presente nella lista
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

        // Creo il div che conterrà la ❌ per eliminare il tag dalla lista e il tag stesso
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

        // Rimuovo l'eventuale div nessuno (questo è quindi il primo tag inserito)
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
        // Aggiungo il div nessuno SE non ci altro piu tag
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
    // Recupero i tag
    var tags = []
    var id = this.value
    var tagslist = document.getElementsByClassName("tagSpan")
    Array.prototype.forEach.call(tagslist, function(tag) {
        tags.push({"name":tag.innerHTML})
    });

    // Aggiorno i tag della playlist
    var res = await putTags(id,tags)
    console.log(res)
    if(res.acknowledged){
        showSuccessAlert("Tag della playlist modificati correttamente") 
    }else{
        showErrorAlert(res.status, res.text)
    }
}

// SEARCH FUNCTIONS

/**
 * Funzione che, dato il valore presente nell'input e lo stato dei 5 switch, fa una ricerca 
 * in base all'input per ogni categoria selezionata
 */
export async function verifySearch(){
    // Verifico che l'input della ricerca non sia vuoto
    var input = document.getElementById("input").value
    if(input==""){return}

    // Recupero i vari switch, controllando che almeno uno sia checkato
    var radioTrack = document.getElementById("track")
    var radioArtist = document.getElementById("artist")
    var radioAlbum = document.getElementById("album")
    var radioPlaylist = document.getElementById("playlist")
    var radioTag = document.getElementById("tag")
    if(!(radioTrack.checked || radioArtist.checked || radioAlbum.checked || radioPlaylist.checked || radioTag.checked)){return}

    // Creo il div che conterrà i risultati
    var prevSearch = document.getElementById("searchResult")
    if(prevSearch){prevSearch.remove()}
    var divSearch = document.createElement("div")
    divSearch.id="searchResult"
    var title = document.createElement("h4")
    title.innerHTML = "Risultati ricerca"
    divSearch.append(title)
    document.getElementById("myPlaylists").parentNode.prepend(divSearch)

    // A seconda degli switch checkati, stampo i risultati delle varie categorie
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
 * Funzione che, dato il valore presente nell'input e lo stato dei 3 switch, fa una ricerca 
 * in base all'input per ogni categoria selezionata
 */
export async function verifySearchPlaylist(){
    // Verifico che l'input della ricerca non sia vuoto
    var input = document.getElementById("input").value
    if(input==""){return}

    // Recupero i vari switch, controllando che almeno uno sia checkato
    var radioPlaylist = document.getElementById("playlist")
    var radioTag = document.getElementById("tag")
    var radioTrack = document.getElementById("track")
    if(!(radioPlaylist.checked || radioTag.checked || radioTrack.checked)){return}

    // Creo il div che conterrà i risultati
    var prevSearch = document.getElementById("searchResult")
    if(prevSearch){prevSearch.remove()}
    var divSearch = document.createElement("div")
    divSearch.id="searchResult"
    var title = document.createElement("h4")
    title.innerHTML = "Risultati ricerca"
    divSearch.append(title)
    document.getElementById("myPlaylists").parentNode.prepend(divSearch)

    // A seconda degli switch checkati, stampo i risultati delle varie categorie
    if(document.getElementById("all").checked){
        printSearchPlaylist(input, divSearch)
        printSearchTag(input, divSearch)
        printSearchPlaylistByTrack(input, divSearch)
        return
    }

    if(radioPlaylist.checked){
        printSearchPlaylist(input, divSearch)
    }
    if(radioTag.checked){
        printSearchTag(input, divSearch)
    }
    if(radioTrack.checked){
        printSearchPlaylistByTrack(input, divSearch)
    }
}

/**
 * Funzione che, dato il valore presente nell'input, accoda nel nodo le track trovate
 * @param {String} input input utilizzato per la ricerca
 * @param {Node} divSearch nodo in cui stampare i risultati
 */
export async function printSearchTrack(input, divSearch){
    // Creo la struttura per i risultati
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

    for(let i=0;i<5;i++){ // Printo 5 card placeholders mentre attendo i risultati
        printCardPlaceholder("searchTrack")
    }

    // Ricerco le track
    var tracks = await searchTrack(input)
    if(tracks.error){
        alert(tracks.error.message)
        return
    }
    tracks=tracks.tracks.items
    console.log(tracks)

    // Stampo le track risultanti
    printPlaylist(tracks, "searchTrack", "top-template")
}

/**
 * Funzione che, dato il valore presente nell'input, accoda nel nodo gli artisti trovati
 * @param {String} input input utilizzato per la ricerca
 * @param {Node} divSearch nodo in cui stampare i risultati
 */
export async function printSearchArtist(input, divSearch){
    // Creo la struttura per i risultati
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
 
    for(let i=0;i<5;i++){ // Printo 5 card placeholders mentre attendo i risultati
        printCardPlaceholder("searchArtist")
    }

    // Ricerco gli artisti
    var artists = await searchArtist(input)
    if(artists.error){
        alert(artists.error.message)
        return
    }
    artists=artists.artists.items
    console.log(artists)
        
    // Printo gli artisti
    printArtists(artists, "searchArtist", "artist-template")
}

/**
 * Funzione che, dato il valore presente nell'input, accoda nel nodo gli album trovati
 * @param {String} input input utilizzato per la ricerca
 * @param {Node} divSearch nodo in cui stampare i risultati
 */
export async function printSearchAlbum(input, divSearch){
    // Creo la struttura per i risultati
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

    for(let i=0;i<5;i++){ // Printo 5 card placeholders mentre attendo i risultati
        printCardPlaceholder("searchAlbum")
    }
    
    // Ricerco gli album
    var albums = await searchAlbum(input)
    if(albums.error){
        alert(albums.error.message)
        return
    }
    albums=albums.albums.items
    console.log(albums)

    // Printo gli album
    printAlbum(albums, "searchAlbum" , "album-template")
}

/**
 * Funzione che, dato il valore presente nell'input, accoda nel nodo le playlist trovate
 * @param {String} input input utilizzato per la ricerca
 * @param {Node} divSearch nodo in cui stampare i risultati
 */
export async function printSearchPlaylist(input, divSearch){
    // Creo la struttura per i risultati
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

    for(let i=0;i<5;i++){ // Printo 5 card placeholders mentre attendo i risultati
        printCardPlaceholder("searchPlaylist")
    }

    var playlists = await searchPlaylist(input)
    console.log(playlists)

    if(playlists.length==0){
        document.getElementById("searchPlaylist").innerHTML=""
        document.getElementById("titleTemp").innerHTML = "Playlist dalla ricerca: nessun risultato"
    }else{
        document.getElementById("searchPlaylist").innerHTML=""
        printContentRows(playlists, "searchPlaylist", "playlist-template", printPlaylistCard)
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
    divResults.id="searchTagPlaylist"
    divResults.classList.add("row")
    div.append(divResults)
    div.classList.add("container")
    divSearch.append(div)

    for(let i=0;i<5;i++){
        printCardPlaceholder("searchTagPlaylist")
    }

    var playlists = await searchPlaylistsByTag(input)
    console.log(playlists)

    if(playlists.length==0){
        document.getElementById("searchTagPlaylist").innerHTML=""
        document.getElementById("titleTemp").innerHTML = "Playlist dalla ricerca: nessun risultato"
    }else{
        document.getElementById("searchTagPlaylist").innerHTML=""
        printContentRows(playlists, "searchPlaylist", "playlist-template", printPlaylistCard)
    }
}

/**
 * Funzione che, dato il valore presente nell'input, accoda nel nodo le playlist trovate
 * @param {String} input input utilizzato per la ricerca
 * @param {Node} divSearch nodo in cui stampare i risultati
 */
export async function printSearchPlaylistByTrack(input, divSearch){
    var div = document.createElement("div")
    var title = document.createElement("h5")
    title.id="titleTemp"
    title.innerHTML = "Playlist dalla ricerca"
    div.append(title)

    var divResults = document.createElement("div")
    divResults.id="searchPlaylistByTrack"
    divResults.classList.add("row")
    div.append(divResults)
    div.classList.add("container")
    divSearch.append(div)

    for(let i=0;i<5;i++){
        printCardPlaceholder("searchPlaylistByTrack")
    }

    var playlists = await searchPlaylistsByTrack(input)
    console.log(playlists)

    if(playlists.length==0){
        document.getElementById("searchPlaylistByTrack").innerHTML=""
        document.getElementById("titleTemp").innerHTML = "Playlist dalla ricerca: nessun risultato"
    }else{
        document.getElementById("searchPlaylistByTrack").innerHTML=""
        printContentRows(playlists, "searchPlaylistByTrack", "playlist-template", printPlaylistCard)
    }
}

// UTILITY FUNCTIONS

/**
 * Funzione che stampa la navbar nel nodo il cui id è passato come argomento
 * @param {String} id id del nodo in cui stampare la navbar 
 */
export async function printNavBar(id){
    var navdiv = document.createElement("div")
    var titlenav = document.createElement("h3")
    titlenav.innerHTML = "Menu"
    navdiv.append(titlenav)
    if (!logged()){
        // Navbar limitata per gli utenti non loggati
        // Link alla home
        var anav = document.createElement("a")
        anav.classList.add("nav","nav-link")
        anav.innerHTML="Home"
        anav.href="/"
        navdiv.append(anav)

        // Link per accedere o registrarsi
        anav = document.createElement("a")
        anav.classList.add("nav","nav-link")
        anav.innerHTML = "Accedi o registrati"
        anav.href = "/src/login.html"
        navdiv.append(anav)

        // Messaggio
        var sub = document.createElement("p")
        sub.innerHTML = "Per accedere alle funzionalità complete, effettua il login o registrati"
        navdiv.append(sub)
    }else{
        // Messaggio
        titlenav = document.createElement("h4")
        var nickname = (window.localStorage.getItem("nickname"))
        if(nickname){
            titlenav.innerHTML = "Benvenuto " + nickname
            titlenav.style = "font-style: italic;"
        }
        navdiv.append(titlenav)

        // Creazione menu
        var nav = document.createElement("nav")
        nav.classList.add("nav", "flex-column")
        
        // Link alla home
        anav = document.createElement("a")
        anav.classList.add("nav-link")
        anav.innerHTML="Home"
        anav.href="/"
        nav.append(anav)

        // Link alla pagina per creare una nuova playlist
        anav = document.createElement("a")
        anav.classList.add("nav-link")
        anav.innerHTML="Crea una playlist"
        anav.href="/src/newplaylist.html"
        nav.append(anav)

        // Link alla pagina per gestire le proprie playlist
        anav = document.createElement("a")
        anav.classList.add("nav-link")
        anav.innerHTML="Gestisci le tue playlist"
        anav.href="/src/playlist.html"
        nav.append(anav)

        // Link alla pagina per gestire il proprio account
        anav = document.createElement("a")
        anav.classList.add("nav-link")
        anav.innerHTML="Gestisci il tuo account"
        anav.href="/src/account.html"
        nav.append(anav)

        // Link per eseguire il logout
        anav = document.createElement("a")
        anav.classList.add("nav-link")
        anav.innerHTML="Logout"
        anav.addEventListener("click", logout)
        anav.href=window.location.href
        nav.append(anav)

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
 * Funzione che riempie la select dei generi con quelli ottenuti da Spotify
 */
export async function loadGenres(){
    var genres = await getGenresSpotify()
    if(genres.error){
        alert(genres.error.message)
        return
    }
    var select = document.getElementById("tagInput")
    console.log(genres)
    genres.genres.forEach(genre => {
        var option = document.createElement("option")
        option.innerHTML = genre
        select.append(option)
    });
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
    var switchs = document.getElementsByClassName("switch")
    for(let i=0;i<switchs.length;i++){
        switchs[i].checked = check
    }
}

/**
 * Cambia la pagina
 */
export function changePagination(){
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