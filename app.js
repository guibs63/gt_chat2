var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.use("/images", express.static(__dirname + '/images'));

app.use("/js", express.static(__dirname + '/js'));

app.use("/css", express.static(__dirname + '/css'));

app.use("/sound", express.static(__dirname + '/sound'));

var server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;



MongoClient.connect('mongodb://127.0.0.1:27017/gt-chat', function(err, db) {
    if(err) throw err;

var collection = db.collection('gt-chat');

//collection.drop();
       collection.count(function(err, count) {
            console.log(format("count = %s", count));

        });
    });
usercolors = {};



usernames = {};

// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo,col) {
        pseudo = ent.encode(pseudo);
if(col)
	{color=col}
else
{
color="#" + Math.random().toString(16).slice(2, 8);
}
col=socket.color;
if (col);
else{ //socket.set('color', color);
	}
socket.color=color;

MongoClient.connect('mongodb://127.0.0.1:27017/gt-chat', function(err, db) {
   if(err) throw err;


   var collection = db.collection('gt-chat');

var history="";
var n=0;
var histo="";
   console.log("******************************Printing docs from Cursor Each")
   collection.find({}, {_id: 0}).sort({$natural: 1}).limit(9).each(function(err, doc) {

 
   //   console.log(doc);
      if(doc != null) {

history=history+console.dir(doc);

    }
   });

//socket.emit('writetochat', 'SERVER',history);
 console.log(history); // concatenation seems ok, the historic is written under the shell & we can see it !



//socket.emit('writetochat', 'SERVER',"history"); // that one is just for testing & it  works (it returns "history")

socket.emit('writetochat', 'SERVER',history); //that one returns only "" (therefor concatenation seems fine because under the shell, we can see the all log history. so this is weird ! )

//io.sockets.emit('writetochat', history);///that one returns undefined( very weird indeed ?! )

});

usercolors[pseudo] = socket.color;

console.log("pseudo is :"+pseudo);
console.log("& color is :"+usercolors[pseudo]);


// we store the username in the socket session for this client
		socket.username = pseudo;
		// add the client's username to the global list
		usernames[pseudo] = "<span class="+pseudo+"><b>"+pseudo+"</b></span>";
		// echo to client they've connected
		if (pseudo && pseudo !="")
		{
		socket.emit('writetochat', 'SERVER', 'Vous êtes connecté,bienvenue <span class='+pseudo+'>'+pseudo+'</span>');
		// echo globally (all clients) that a person has connected
		// socket.broadcast.emit('updatechat', 'SERVER', username + 'has connected');
		// update the list of users in chat, client-side


console.log("/////////////////////////////////");
console.log(usernames);
		io.sockets.emit('updateusers', usernames);

 socket.emit('get_color', pseudo, usercolors[pseudo]);
}


socket.on('disconnect', function(){

    console.log('user '+pseudo+'      disconnected');
		if (pseudo && pseudo !="")
		{

	// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
 socket.broadcast.emit('disconnection', pseudo, usercolors[pseudo]);
		}
  });



//        socket.set('pseudo', pseudo);
socket.pseudo=pseudo;
console.log(socket.color );
        socket.broadcast.emit('nouveau_client', pseudo,socket.color);
     //   socket.broadcast.emit('nouveau_client', pseudo,color);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message,pseudo,col) {
        //socket.get('pseudo', function (error, pseudo) {
            message = ent.encode(message);

date = new Date;
h = date.getHours();
        if(h<10)
        {
                h = "0"+h;
        }
        m = date.getMinutes();
        if(m<10)
        {
                m = "0"+m;
        }
        s = date.getSeconds();
        if(s<10)
        {
                s = "0"+s;
        }
var time = h+":"+m+":"+s;
//var mess = 'The quick brown fox jumps over the lazy dog';
MongoClient.connect('mongodb://127.0.0.1:27017/gt-chat', function(err, db) {
    if(err) throw err;

    var collection = db.collection('gt-chat');

color=socket.color;

mess="<strong>"+time+"</strong><span style='color:"+col+"'><b>"+pseudo+"</b></span><em> "+message+"</em>";

    collection.insert({message:mess}, function(err, docs) {
        console.log("//////////////\r\n mess insertion :"+mess);
        collection.count(function(err, count) {
            console.log("count = %s", count);
        });
    });
});
var u_color=col;
		// echo to client they've connected

            socket.broadcast.emit('message', {color:u_color, time: time, pseudo: pseudo, message: message});
      //  });
    }); 
});

server.listen(8080);