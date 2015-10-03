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
    // TODO: make sure not owner of poll
    // if voteInfo.id != socket.id, emit and increme
    if(voteInfo.id != socket.id) {
      activePolls[voteInfo.id]++;
      io.emit('update_vote', voteInfo);
    }
  });

  socket.on('new_poll', function(pollInfo) {
    // only add the new poll if this socket doesn't already have a poll
    if( !socket.id in activePolls ) {
      activePolls[socket.id] = pollInfo;
      io.emit('new_poll', pollInfo);

      // start timer, at timeout send out a message
      window.setTimeout(function() {

        // move from active to inactive
        inactivePolls[socket.id] = activePolls[socket.id];
        delete activePolls[socket.id];

        io.emit('timeout_poll', pollInfo);
      }, 1000 * 30);
    }
  });

  // the below only emits the current polls to the new socket
  io.sockets.connected[socket.id].emit('current_polls',
      { 'activePolls': activePolls, 'inactivePolls': inactivePolls });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

