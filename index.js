var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use("/style", express.static(__dirname + '/style'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/poll.js', function(req, res){
  res.sendFile(__dirname + '/poll.js');
});


activePolls = {}
inactivePolls = {}

io.on('connection', function(socket){
  console.log('connected ' + socket.id);

  socket.on('vote', function(voteInfo){
    io.emit('vote', voteInfo);
  });

  socket.on('new_poll', function(pollInfo){
    // only add the new poll if this socket doesn't already have a poll
    if( !socket.id in activePolls ) {
      activePolls[socket.id] = pollInfo;
      io.emit('new_poll', pollInfo);
    }
  });

  // the below only emits the current polls to the new socket
  io.sockets.connected[socket.id].emit('current_polls',
      { 'activePolls': activePolls, 'inactivePolls': inactivePolls });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

