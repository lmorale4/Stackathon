const express = require('express');
const app = express();
const socketio = require('socket.io');

const players = {};

const PORT = 8082;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

const server = app.listen(PORT, function() {
  console.log(`Listening on ${PORT}`);
});

const io = socketio(server);
io.on('connection', function(socket) {
  console.log('a user connected', socket.id);
  const spawn = {
    x: 200,
    y: 200,
  };
  // create a new player and add it to our players object
  players[socket.id] = {
    x: spawn.x,
    y: spawn.y,
    playerId: socket.id,
  };
  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
  socket.on('disconnect', function() {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });
  // when a player moves, update the player data
  socket.on('playerMovement', function(movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].xVel = movementData.xVel;
    players[socket.id].yVel = movementData.yVel;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
});
