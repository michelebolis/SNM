const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const auth = require('./authentication').auth
const crypto = require('crypto')
var cors = require('cors')
const express = require('express')
const path = require('path');
const uri = "mongodb+srv://admin:5IwstKczRMmtfJz9@snm.9wgaijz.mongodb.net/?retryWrites=true&w=majority";

const app = express()
app.use(cors())
// app.use(auth) Per avere apikey su tutti gli endpoint
app.use(express.json())

app.get('/', function (req, res) { // mando la pagina HTML di base
    res.sendFile(path.join(__dirname, '/index.html'));
});
app.listen(3100, "0.0.0.0", () => { // apre il web server sulla porta 3100
    console.log("Listening on 3100")
})
app.use(express.static(__dirname + '/asset')); // carica i file statici dell'applicativo

/**
 * Funzione che applica un metodo di hashing ad un input testuale
 * @param {String} input  
 * @returns oggetto hashato
 */
function hash(input) {
    return crypto.createHash('md5')
        .update(input)
        .digest('hex')
}
app.get('/users/:id', auth, async function (req, res) {
    // Ricerca nel database
    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    var user = await pwmClient.db("SNM")
        .collection('Users')
        .find({ "_id": new ObjectId(id) })
        .toArray();
    res.json(user)
})

async function addUser(res, user) {
    if (user.email == undefined) {
        res.status(400).send("Missing Email")
        return
    }
    if (user.password == undefined || user.password.length < 3) {
        res.status(400).send("Password is missing or too short")
        return
    }

    user.password = hash(user.password)

    var pwmClient = await new mongoClient(uri).connect()
    try {
        var items = await pwmClient.db("SNM").collection('Users').insertOne(user)
        res.json(items)
    }
    catch (e) {
        console.log('catch in test');
        if (e.code == 11000) {
            res.status(400).send("Utente già presente")
            return
        }
        res.status(500).send(`Errore generico: ${e}`)

    };
}
function deleteUser(res, id) {
    let index = users.findIndex(user => user.id == id)
    if (index == -1) {
        res.status(404).send("User not found")
        return
    }
    users = users.filter(user => user.id != id)

    res.json(users)
}
async function updateUser(res, id, updatedUser) {
    if (updatedUser.nickname == undefined) {
        res.status(400).send("Missing Name")
        return
    }
    if (updatedUser.email == undefined) {
        res.status(400).send("Missing Email")
        return
    }
    if (updatedUser.password != undefined) {
        updatedUser.password = hash(updatedUser.password)
    }
    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(id) }
        var updatedUserToInsert = {
            $set: updatedUser
        }

        var item = await pwmClient.db("SNM")
            .collection('Users')
            .updateOne(filter, updatedUserToInsert)

        res.json(item)
    } catch (e) {
        console.log('catch in test');
        if (e.code == 11000) {
            res.status(400).send("Utente già presente")
            return
        }
        res.status(500).send(`Errore generico: ${e}`)

    };
}

app.get('/users', auth, async function (req, res) {
    var pwmClient = await new mongoClient(uri).connect()
    var users = await pwmClient.db("SNM").collection('users').find().project({ "password": 0 }).toArray();
    res.json(users)
})

app.post("/users", auth, function (req, res) {
    addUser(res, req.body)
})

app.post("/login", async (req, res) => {
    login = req.body

    if (login.email == undefined) {
        res.status(400).send("Missing Email")
        return
    }
    if (login.password == undefined) {
        res.status(400).send("Missing Password")
        return
    }

    login.password = hash(login.password)

    var pwmClient = await new mongoClient(uri).connect()
    var filter = {
        $and : [
            {"email": login.email},
            {"password": login.password}
        ]
    }
    var loggedUser = await pwmClient.db("SNM")
    .collection('Users')
    .findOne(filter);
    console.log(loggedUser)

    if (loggedUser == null) {
        res.status(401).send("Unauthorized")
    } else {
        res.send({ loggedUser })
    }
}
)

app.put("/users/:id", auth, function (req, res) {
    updateUser(res, req.params.id, req.body)
})

app.delete("/users/:id", auth, function (req, res) {
    deleteUser(res, req.params.id)
})

app.post("/playlist", auth, function (req, res) {
    addPlaylist(res, req.body)
})

async function addPlaylist(res, playlist) {
    if (playlist.name == undefined) {
        res.status(400).send("Missing name")
        return
    }
    if (playlist.name == "") {
        res.status(400).send("Missing name")
        return
    }
    var pwmClient = await new mongoClient(uri).connect()
    try {
        var items = await pwmClient.db("SNM").collection('Playlists').insertOne(playlist)
        res.json(items)
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
}

app.get('/playlists', auth, async function (req, res) {
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .find({"public":true})
        .toArray();
    res.json(playlists)
})

app.get('/playlists/:user', auth, async function (req, res) {
    // Ricerca nel database
    var user = req.params.user
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .find({ "owner": user })
        .toArray();
    res.json(playlists)
})

app.put('/playlist/add/follow/:id', auth, async function (req, res) {
    // Ricerca nel database
    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .updateOne({"_id" : new ObjectId(id)}, {"$push" : {"followers":req.body}})
    res.json(playlists)
})

app.put('/playlist/remove/follow/:id', auth, async function (req, res) {
    // Ricerca nel database
    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .updateOne({"_id" : new ObjectId(id)}, {"$pull" : {"followers":req.body}})
    res.json(playlists)
})

app.get('/playlists/info/:id', auth, async function (req, res) {
    // Ricerca nel database
    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .find({ "_id": new ObjectId(id) })
        .toArray();
    res.json(playlists)
})

app.get('/playlists/search/:playlist', auth, async function (req, res) {
    // Ricerca nel database
    var playlist = req.params.playlist
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .find({$and:[{ "name": playlist} , {"public":true}]})
        .toArray();
    res.json(playlists)
})

app.get('/playlists/tag/:tag', auth, async function (req, res) {
    // Ricerca nel database
    var tag = req.params.tag
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .find({$and:[{ "tags": {"name" : tag}} , {"public":true}]})
        .toArray();
    res.json(playlists)
})

app.get('/playlists/followedby/:user', auth, async function (req, res) {
    // Ricerca nel database
    var user = req.params.user
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .find({$and:[{"public":true}, {"followers" : {"id":user}}]})
        .toArray();
    res.json(playlists)
})

app.put('/playlists/:playlist', auth, async function (req, res) {
    // Ricerca nel database
    var playlist = req.params.playlist
    var pwmClient = await new mongoClient(uri).connect()
    var track = req.body
    var myplaylist = pwmClient.db("SNM")
    .collection('Playlists').find({$and:[{"_id" : new ObjectId(playlist)}, {"tracks": track}]})
    
    if(await myplaylist.next()){
        res.statusMessage = "Canzone gia presente nella playlist"
        res.sendStatus(400)
    }else{
        var newplaylist = await pwmClient.db("SNM")
        .collection('Playlists')
        .updateOne(
            {"_id" : new ObjectId(playlist)},
            {"$push" : {"tracks":track}}
        )
        console.log(newplaylist)
        res.json(newplaylist)
    }
})

app.delete('/playlist/:id', auth, async function (req, res) {
    // Ricerca nel database
    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    var myplaylist = pwmClient.db("SNM")
    .collection('Playlists').deleteOne({"_id" : new ObjectId(id)})
    return myplaylist
})