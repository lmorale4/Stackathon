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
    x: 300,
    y: 600,
    hText: 16,
    mode: 'player1',
  };
  // create a new player and add it to our players object
  const keys = Object.keys(players);
  if (keys.length) {
    spawn.x = 600;
    spawn.hText = 616;
    spawn.mode = keys.length === 1 ? 'player2' : 'viewer';
  }
  players[socket.id] = {
    x: spawn.x,
    y: spawn.y,
    playerId: socket.id,
    mode: spawn.mode,
    health: 100,
    hText: spawn.hText,
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
    players[socket.id].health = movementData.health;

    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
});
