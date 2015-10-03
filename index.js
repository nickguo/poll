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

/*
    var pollData = 
      {
        'id': socket.id,
        'title': 'pokemon', //$('#pollName').val(),
        'options': {
          'name1': 0,
          'name2': 0
        }
      };

    var vote = {optionName}
      */


polls = {};

io.on('connection', function(socket){
  console.log('connected ' + socket.id);

  socket.on('vote', function(vote){
    // TODO: make sure not owner of poll
    // if vote.id != socket.id, emit and increme
    if(vote.id != socket.id) {
      polls[vote.id]['options'][vote.option]++;
      io.emit('update_vote', vote);
    }
  });

  socket.on('new_poll', function(poll) {
    // only add the new poll if this socket doesn't already have a poll
    console.log('got new poll');
    if( !(socket.id in polls) ) {
      console.log('making new poll');
      polls[socket.id] = poll;
      io.emit('new_poll', poll);

      // start timer, at timeout send out a message
      setTimeout(function() {
        delete polls[socket.id];

        io.emit('timeout_poll', poll);
      }, 1000 * 10);
    }
  });

  // the below only emits the current polls to the new socket
  io.sockets.connected[socket.id].emit('current_polls', polls);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

