var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/poll.js', function(req, res){
  res.sendFile(__dirname + '/poll.js');
});

io.on('connection', function(socket){
  console.log('connected');

  socket.on('vote', function(vote_info){
    io.emit('vote', vote_info);

  });

  socket.on('new_poll' function(poll_info){

  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

