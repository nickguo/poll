var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var async = require('async');

var ibmbluemix = require('ibmbluemix');

var config = {
  applicationRoute: 'team-kiwi.mybluemix.net',
  applicationId: 'team_kiwi'
}

app.use("/style", express.static(__dirname + '/style'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/poll.js', function(req, res){
  res.sendFile(__dirname + '/poll.js');
});

polls = {};

io.on('connection', function(socket){
  console.log('connected ' + socket.id);

  socket.on('vote', function(vote){
    // TODO: FIX VOTE
    console.log("GOT VOTE: " + polls);
    // if vote.id != socket.id, emit and increme
    if(vote.id in polls && vote.id != socket.id) {
      if (!('voters' in polls[vote.id])) {
        polls[vote.id]['voters'] = {};
      }
      if (!(socket.id in polls[vote.id]['voters'])) {
        polls[vote.id]['options'][vote.optIndex]['votes']++;
        polls[vote.id]['voters'][socket.id] = vote.optIndex;
        vote["option0"] =  polls[vote.id]["options"][0].votes;
        vote["option1"] =  polls[vote.id]["options"][1].votes;
        io.emit('update_vote', vote);
      }
    }
  });

  socket.on('new_poll', function(poll) {
    // only add the new poll if this socket doesn't already have a poll
    if( !(socket.id in polls) ) {
      polls[socket.id] = poll;
      asyncCalls = [];
      for (index in poll.options) {
        (function(i) {
          asyncCalls.push(function(callback) {
            request('https://ajax.googleapis.com/ajax/services/search/images?v=1.1&safe=active&q=' + poll.options[i].name,
              function(error, response, body) {
                body = JSON.parse(body);
                try {
                  imageURL = body.responseData.results[0].url;
                } catch (ex) {
                  imageURL = 'http://photodocumentor.com/wp-content/uploads/rulers/unavailable.gif'
                }
                callback(false, imageURL);
            })});
          }(index));
      }
      async.parallel(asyncCalls, function(err, results) {
        // save the image URLs into the poll
        poll.options[0].img = results[0];
        poll.options[1].img = results[1];
        io.emit('new_poll', poll);
      });

      // start timer, at timeout send out a message
      setTimeout(function() {
        delete polls[socket.id];
        io.emit('timeout_poll', poll);
      }, 1000 * 75);
    }
  });

  // the below only emits the current polls to the new socket
  io.sockets.connected[socket.id].emit('current_polls', polls);
});

var port = process.env.VCAP_APP_PORT  || 1200;

http.listen(port, function(){
  console.log('listening on *:3000');
});

