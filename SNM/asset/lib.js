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
    console.log(playlist)
    for (let i=0; i<playlist.items.length; i++){
        clone = template.cloneNode(true)
        clone.id="top" + i
        clone.getElementsByClassName("card-img-top")[0].src = playlist.items[i].track.album.images[0].url
        clone.getElementsByClassName("nome_traccia")[0].innerHTML = playlist.items[i].track.name
        clone.getElementsByClassName("nome_artista")[0].innerHTML = playlist.items[i].track.artists[0].name
        document.getElementById('top').appendChild(clone)
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
/*
async function getFile(url){
    try {
        const res = await fetch(url);
        const data = await res.text();
        console.log(data);
        return data
    } catch (err) {
        console.error(err);
    }
}

function printCardPlaceholder(id){
   card = (getFile("cardPlaceholder.html"))
   console.log(card)
   document.getElementById(id).append(card)
    /* document.getElementById(id).append()
    
}*/