var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');

const mysql = require('mysql2');

const connection = mysql.createConnection({
	host: 'localhost',
	user:'root',
	database:'multi_chess'
});

connection.query('select * from users', function(err, results, fields){
console.log(results);
//console.log(fields);
});

app.use(express.static('public'))

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/');
});

let userList = [];
let messages = [];
let games = [];

var roomno = 1;

io.on('connection', (socket) => {

	
//Increase roomno 2 clients are present in a room.
//if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1) roomno++;
//socket.join("room-"+roomno);


//console.log(socket.adapter);
//Send this event to everyone in the room.
io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);


	socket.on('userlogin', (name) => {
		
		userList.push({
			id:socket.id,
			details:name
		});
		console.log("name değeri " + name.name);
		const username = "<li id='" + socket.id + "'>" + name.name + "</li>";
		io.emit('username', username);
		//io.emit('users', userList);
		//socket.emit('firstuserlist', userList);
		console.log(userList);
	});
	

	socket.emit('firstuserlist', userList);
	console.log('bir kullanıcı geldi');

	socket.on('disconnect', () => {
		console.log('bir kullanıcı çıktı');
		//console.log(socket.id);
		const userdelete = socket.id;
		io.emit('userdelete', userdelete);
	const index = userList.findIndex((element, index) => {
		if(element.id === socket.id){
			//console.log(element.id);
			userList.splice(index, 1);
		  //delete users[index];
		  io.emit('users', userList);
		  
		  return true;
		}
	});
	});

	socket.on('newmessage', (data) => {
		messages.push({
			message:data.message,
			name:data.name
		});
		io.emit('mesajadded',data);
	});


});

http.listen(3000, () => {
	console.log('3000 de dinliyoruz');
});