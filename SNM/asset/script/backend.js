const MY_BASE_URL = "http://127.0.0.1:3100/"
/**
 * Funzione che effettua la chiamata all'API per effettuare il login
 * @param {*} user json contenente email e password
 * @returns SE le credenziali sono corrette, restituisce un json con i dati dell'utente
 *          ALTRIMENTI restituisce un errore nel formato json {text, status}
 */
export async function userLogin(user){
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
export async function getUser(id){
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
export async function postUser(user){
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
export async function putUser(id, user){
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
 * Funcione che effettua la chiamata all'API per cancellare un utente
 * @param {String} id id dell'utente da cancellare 
 * @returns 
 */
export async function deleteUser(id){
    return fetch(MY_BASE_URL+"users/"+id+"?apikey=123456", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    })
}

/**
 * Funzione che effettua la chiamata all'API che aggiunge una nuova playlist
 * @param {*} playlist json contenente la playlist da aggiungere
 */
export async function postPlaylist(playlist) {
    return fetch(MY_BASE_URL+"playlist?apikey=123456", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(playlist)
    }).then(async res => {
        if (res.ok) {
            return res.json()
        } else {
            return {text: res.statusText, status: res.status}
        }
    })
}

/**
 * Funzione che effettua la chiamata all'API per cancellare una playlist
 * @param {String} id id della playlist da cancellare
 */
export async function deletePlaylist(id) {
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
 * @param {String} id id dell'utente
 * @returns array di json delle sue playlist
 */
export async function getMyPlaylist(id){
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
 * Funzione che effettua la chiamata all'API che restituisce le playlist seguite da un utente
 * @param {String} id id dell'utente 
 * @returns array di json delle playlist seguite dall'utente
 */
export async function getFollowedPlaylists(id){
    return fetch(MY_BASE_URL+"playlists/followedby/"+id+"?apikey=123456", {
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
 * @param {String} id id della playlist di cui si richiedono le informazioni
 */
export async function getPlaylist(id){
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
 * 
 * @returns array di json delle playlist pubbliche
 */
export async function getPublicPlaylist(){
    return fetch(MY_BASE_URL+"playlists?apikey=123456", {
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
export async function addFollow(id, newfollower){
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
export async function removeFollow(id, oldfollower){
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
 * Funzione che effettua la chiamata all'API per cambiare la visibilità della playlist
 * @param {String} id id della playlist
 * @param {bool} publicVisibility SE la playlist è pubblica
 * @returns 
 */
export async function changePlaylistVisibility(id, publicVisibility){
    return fetch(MY_BASE_URL+"playlist/visibility/"+id+"?apikey=123456", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"public":publicVisibility})
    })
    .then(async response => {return response.json()})
    .catch((e) => console.log(e))
}

/**
 * Funzione che effettua la chiamata all'API per ricercare una playlist pubblica dato il suo nome
 * @param {String} playlist nome della playlist
 * @returns Array di playlist SE ce ne sono con quel name
 */
export async function searchPlaylist(playlist){
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
 * Funzione che effettua la chiamata all'API per ricercare una playlist pubblica dato un suo tag
 * @param {String} tag tag della playlist
 * @returns Array di playlist SE ce ne sono con quel tag
 */
export async function searchPlaylistsByTag(tag){
    return fetch(MY_BASE_URL+"playlists/tag/"+tag+"?apikey=123456", {
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
export async function putPlaylist(){
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