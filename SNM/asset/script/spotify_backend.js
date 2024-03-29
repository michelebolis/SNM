const BASE_URL = "https://api.spotify.com/v1/"
const client_id = "8c847d5d66cd43f28e29a4e4f8d5f1cc"
const client_secret = "62d9042a1da54e519cee47245ccfa8c5"
var URL_TOKEN = "https://accounts.spotify.com/api/token"
var access_token
/**
 * Collegamento alle API di spotify attraverso l'id e codice segreto del client, 
 * ottenendo un token per effettuare le chiamate API
 */
async function connect(){
    await fetch(URL_TOKEN, {
        method: "POST",
        headers: {
            Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
    })
    .then((res) => res.json()).then((tokenResponse) => {
        localStorage.setItem("token", tokenResponse.access_token)
        access_token = localStorage.getItem("token") // salvo il token nel local storage
    })
}

access_token = localStorage.getItem("token") // salvo il token nel local storage
if (!access_token){
    connect()
}

// TRACKS FUNCTIONS

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni su una track
 * @param {String} id id di Spotify della traccia
 * @returns json contenente le informazioni sulla track oppure un errore
 */
export async function getTrack(id) {
    return fetch(`${BASE_URL}tracks/${id}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async (res) => { 
        if(res.status==401){
            connect()
            return await getTrack(id)
        }
        if(res.status==429){
            return {"error" : {"message" : "API rate excedded"}}
        }
        return res.json() 
    })
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le track suggerite dati i propri generi preferiti
 * @param {String} genres comma separated string 
 * @returns json contenente le informazioni sulla track oppure un errore
 */
export async function getRecommendations(genres){
    return fetch(`${BASE_URL}recommendations?seed_genres=${genres}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async (res) => { 
        if(res.status==401){
            connect()
            return await getRecommendations(genres)
        }
        if(res.status==429){
            return {"error" : {"message" : "API rate excedded"}}
        }
        return res.json() 
    })
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le 50 track piu ascoltate in Italia
 */
export async function getTopCharts(){
    return fetch(`${BASE_URL}search?type=playlist&q=${'Top 50 - Italy'}&limit=1`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async (res) => {
        if (res.status==401){
            connect()
            return await getTopCharts()
        }
        if(res.status==429){
            return {"error" : {"message" : "API rate excedded"}}
        }
        var searchResults = await res.json()
        return await getPlaylistSpotify(searchResults.playlists.items[0].tracks.href)
    })
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che ricerca le canzoni in base al nome della track data
 * @param {String} track nome della track da ricercare
 * @returns array di json contenenti le track risultanti
 */
export async function searchTrack(track){
    return fetch(`${BASE_URL}search?q=${track}&type=track`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async res => {
        if (res.status==401){
            connect()
            return await searchTrack(track)
        }
        if(res.status==429){
            return {"error" : {"message" : "API rate excedded"}}
        }
        return res.json()
    })
    .catch((e) => console.log(e))
}

// ALBUM FUNCTIONS

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni su un album
 * @param {String} id id di Spotify dell'album
 * @returns json contenente le informazioni sull'album
 */
export async function getAlbum(id) {
    return fetch(`${BASE_URL}albums/${id}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async res => {
        if (res.status==401){
            connect()
            return await getAlbum(id)
        }
        if(res.status==429){
            return {"error" : {"message" : "API rate excedded"}}
        }
        return res.json()
    })
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni sugli album dell'artista
 * @param {String} id id di Spotify dell'artista
 * @returns array di json contenente le informazioni sugli album
 */
export async function getAlbumByArtist(id) {
    return fetch(`${BASE_URL}artists/${id}/albums`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async res => {
        if (res.status==401){
            connect()
            return await getAlbumByArtist(id)
        }
        return res.json()
    })
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che ricerca gli album in base al nome dell'album dato
 * @param {String} album nome dell'album da ricercare
 * @returns array di json contenenti gli album risultanti
 */
export async function searchAlbum(album){
    return fetch(`${BASE_URL}search?q=${album}&type=album`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async res => {
        if (res.status==401){
            connect()
            return await searchAlbum(album)
        }
        if(res.status==429){
            return {"error" : {"message" : "API rate excedded"}}
        }
        return res.json()
    })
    .catch((e) => console.log(e))
}

// ARTISTS FUNCTIONS

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni dell'artista
 * @param {String} id id di Spotify dell'artista 
 * @returns json contenente le informazioni dell'artista
 */
export async function getArtist(id) {
    return fetch(`${BASE_URL}artists/${id}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async res => {
        if (res.status==401){
            connect()
            return await getArtist(id)
        }
        if(res.status==429){
            return {"error" : {"message" : "API rate excedded"}}
        }
        return res.json()
    })
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni sulle top track di un artista (max 10)
 * @param {String} id id di Spotify dell'artista
 * @returns array di json contente le informazioni sulle track
 */
export async function getTopTracks(id) {
    return fetch(`${BASE_URL}artists/${id}/top-tracks?market=ES`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async res => {
        if (res.status==401){
            connect()
            return await getTopTracks(id)
        }
        if(res.status==429){
            return {"error" : {"message" : "API rate excedded"}}
        }
        return res.json()
    })
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che ricerca gli artist in base al nome dell'artist dato
 * @param {String} artist nome dell'artist da ricercare
 * @returns array di json contenenti gli artist risultanti
 */
export async function searchArtist(artist){
    return fetch(`${BASE_URL}search?q=${artist}&type=artist`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async res => {
        if (res.status==401){
            connect()
            return await searchArtist(artist)
        }
        if(res.status==429){
            return {"error" : {"message" : "API rate excedded"}}
        }
        return res.json()
    })
    .catch((e) => console.log(e))
}

// UTILITY FUNCTIONS

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce le informazioni sulla playlist di Spotify
 * @param {*} url url di una playlist di Spotify 
 * @returns informazioni sulla playlist
 */
export async function getPlaylistSpotify(url){
    return fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async res => {
        if (res.status==401){
            connect()
            return await getPlaylistSpotify(url)
        }
        if(res.status==429){
            return {"error" : {"message" : "API rate excedded"}}
        }
        return res.json()
    })
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API di Spotify che restituisce i generi di Spotify
 * @returns array dei generi
 */
export async function getGenresSpotify(){
    return fetch('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + access_token,
        },
    })
    .then(async res => {
        if (res.status==401){
            connect()
            return await getGenresSpotify()
        }
        if(res.status==429){
            return {"error" : {"message" : "API rate excedded"}}
        }
        return res.json()
    })
    .catch((e) => console.log(e))
}