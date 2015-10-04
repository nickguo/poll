var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var async = require('async');

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
    // if vote.id != socket.id, emit and increme
    if(vote.id in polls){ //&& vote.id != socket.id) {
      if (!('voters' in polls[vote.id])) {
        polls[vote.id]['voters'] = {};
        console.log('created voters for ' + vote.id);
      }
      if (!(socket.id in polls[vote.id]['voters'])) {
        polls[vote.id]['options'][vote.optIndex]['votes']++;
        polls[vote.id]['voters'][socket.id] = vote.optIndex;
        io.emit('update_vote', vote)
      }
    }
  });

  socket.on('new_poll', function(poll) {
    // only add the new poll if this socket doesn't already have a poll
    console.log('got new poll');
    if( !(socket.id in polls) ) {
      console.log('making new poll');
      polls[socket.id] = poll;
      asyncCalls = []
      for (option in poll.options) {
        (function(opt) {
          asyncCalls.push(function(callback) {
            request('https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=' + opt,
              function(error, response, body) {
                body = JSON.parse(body);
                imageURL = body.responseData.results[0].url;
                console.log(imageURL);
                callback(false, imageURL);
            })});
          }(option));
      }
      async.parallel(asyncCalls, function(err, results) {
        poll.options[0] = results[0];
        poll.options[1] = results[1];
        io.emit('new_poll', poll);
      });

      // start timer, at timeout send out a message
      setTimeout(function() {
        delete polls[socket.id];
        io.emit('timeout_poll', poll);
      }, 1000 * 100);
    }
  });

  // the below only emits the current polls to the new socket
  io.sockets.connected[socket.id].emit('current_polls', polls);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

