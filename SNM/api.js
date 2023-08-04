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

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
//Users
app.get('/users/:id', auth, async function (req, res) {
    // Ricerca nel database
    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    var user = await pwmClient.db("SNM")
        .collection('Users')
        .findOne({ "_id": new ObjectId(id) })
    res.json(user)
})

app.get('/users', auth, async function (req, res) {
    var pwmClient = await new mongoClient(uri).connect()
    var users = await pwmClient.db("SNM").collection('Users').find().project({ "password": 0 }).toArray();
    res.json(users)
})

app.post("/users", auth, async function (req, res) {
    var user = req.body
    if (user.nickname == undefined) {
        res.statusMessage = "Missing Nickname"
        res.status(400)
        res.send()
        return
    }
    if (user.nickname == "") {
        res.statusMessage = "Empty Nickname"
        res.status(400)
        res.send()
        return
    }
    if (user.email == undefined) {
        res.statusMessage = "Missing Email"
        res.status(400)
        res.send()
        return
    }
    if (user.email == "") {
        res.statusMessage = "Empty Email"
        res.status(400)
        res.send()
        return
    }
    if (!user.email.includes("@")) {
        res.statusMessage = "Email doesn't contain @"
        res.status(400)
        res.send()
        return
    }
    if (user.password == undefined) {
        res.statusMessage = "Missing Password"
        res.status(400)
        res.send()
        return
    }
    if (user.password == "") {
        res.statusMessage = "Empty Password"
        res.status(400)
        res.send()
        return
    }
    if (user.favorite_genres == undefined || user.favorite_genres == ""){
        res.statusMessage = "Missing Favorite Genres"
        res.status(400)
        res.send()
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
})

app.post("/login", auth, async (req, res) => {
    login = req.body
    if (login.email == undefined) {
        res.statusMessage = "Missing Email"
        res.status(400)
        res.send()
        return
    }
    if (login.email == "") {
        res.statusMessage = "Empty Email"
        res.status(400)
        res.send()
        return
    }
    if (!login.email.includes("@")){
        res.statusMessage = "Email doesn't contain @"
        res.status(400)
        res.send()
        return
    }
    if (login.password == undefined) {
        res.statusMessage = "Missing Password"
        res.status(400)
        res.send()
        return
    }
    if (login.password == "") {
        res.statusMessage = "Empty Password"
        res.status(400)
        res.send()
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
        res.status(401).send("Email or password wrong")
    } else {
        res.send({ loggedUser })
    }
}
)

app.put("/users/:id", auth, async function (req, res) {
    var id = req.params.id
    var updatedUser = req.body
    if (updatedUser.nickname == undefined) {
        res.statusMessage = "Missing Nickname"
        res.status(400)
        res.send()
        return
    }
    if (updatedUser.nickname == ""){
        res.statusMessage = "Empty Nickname"
        res.status(400)
        res.send()
        return
    }
    if (updatedUser.email == undefined) {
        res.statusMessage = "Missing Email"
        res.status(400)
        res.send()
        return
    }
    if (updatedUser.email == ""){
        res.statusMessage = "Empty Email"
        res.status(400)
        res.send()
        return
    }
    if (updatedUser.favorite_genres == undefined || updatedUser.favorite_genres == ""){
        res.statusMessage = "Missing Favorite genres"
        res.status(400)
        res.send()
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
        if (e.code == 11000) {
            res.statusMessage = "Utente già presente, prova un'altra email"
            res.status(400)
            res.send()
            return
        }
        res.status(500).send(`Errore generico: ${e}`)

    };
})

app.delete("/users/:id", auth, async function (req, res) {
    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    var user = await pwmClient.db("SNM").collection('Users').find({"_id":new ObjectId(id)})
    if (await user.hasNext()) {
        pwmClient.db("SNM").collection('Users').deleteOne({"_id":new ObjectId(id)})
        pwmClient.db("SNM").collection('Playlists').updateMany({"followers":{"id":id}}, {$pull : {"followers":{"id":id}}})
    }else{
        res.status(404).send("User not found")
        return
    }
})

//Playlist
app.get('/playlists', auth, async function (req, res) {
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .find({"public":true})
        .toArray();
    res.json(playlists)
})

app.post("/playlist", auth, async function (req, res) {
    var playlist = req.body
    if (playlist.name == undefined) {
        res.statusMessage = "Missing name"
        res.status(400)
        res.send()
        return
    }
    if (playlist.name == "") {
        res.statusMessage = "Empty name"
        res.status(400)
        res.send()
        return
    }
    var pwmClient = await new mongoClient(uri).connect()
    try {
        var items = await pwmClient.db("SNM").collection('Playlists').insertOne(playlist)
        res.json(items)
    }
    catch (e) {
        res.status(500).send(`Errore generico: ${e}`)
    };
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

app.put('/playlist/visibility/:id', auth, async function (req, res) {
    // Ricerca nel database
    var id = req.params.id
    var visibility = req.body
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .updateOne({"_id" : new ObjectId(id)}, {$set : visibility})
    res.json(playlists)
})

app.put('/playlist/tag/:id', auth, async function (req, res) {
    // Ricerca nel database
    var id = req.params.id
    var tags = req.body
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .updateOne({"_id" : new ObjectId(id)}, {$set : tags})
    res.json(playlists)
})

app.get('/playlists/info/:id', auth, async function (req, res) {
    // Ricerca nel database
    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    var playlists = await pwmClient.db("SNM")
        .collection('Playlists')
        .findOne({ "_id": new ObjectId(id) })
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