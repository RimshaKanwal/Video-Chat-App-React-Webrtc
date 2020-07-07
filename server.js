const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);

const users = [];
var getUser = (nameKey, myArray) => {
	for (var i = 0; i < myArray.length; i++) {
		if (myArray[i].id === nameKey) {
			return myArray[i];
		}
	}
};
io.on('connection', async (socket) => {
	socket.on('send-nickname', function (nickname) {
		socket.nickname = nickname;

		if (!users.some((user) => user.id === socket.id)) {
			var user = {
				id: socket.id,
				name: socket.nickname,
			};
			users.push(user);
			console.log(users);
			socket.emit('user', user);
			socket.emit('allUsers', users);
		}
	});
	socket.on('disconnect', () => {
		var result = getUser(socket.id, users);
		var index = users.indexOf(result);
		users.splice(index, 1);
	});
	socket.on('callUser', (data) => {
		io.to(data.userToCall).emit('hey', {
			signal: data.signalData,
			from: data.from,
			fromName: getUser(data.from.toString(), users).name,
		});
	});

	socket.on('acceptCall', (data) => {
		io.to(data.to).emit('callAccepted', data.signal);
	});
});

server.listen(8000, () => console.log('server is running on port 8000'));
