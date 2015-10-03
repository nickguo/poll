function makePoll(socket, poll) {
  var pollDiv = $('<div id="' + poll.id + '" class="activePollMenu"></div>');
  pollDiv.append(poll['title'] + "<br>");
  for (var key in poll['options']) {
    console.log('created: ' + poll.id + key);
    pollDiv.append(key + ": ");
    $('<button id="' + poll.id + key +'">')
      .text(poll['options'][key])
      .appendTo(pollDiv)
      .click(function() {
        socket.emit('vote', { 'id': poll.id, 'option': key });
        console.log('clicked: ' + poll.id + key);
      });
    pollDiv.append("<br>");
  }
  $("#activePolls").append(pollDiv);
  for (var key in poll['options']) {
  }
}

$(document).ready(function() {
  var socket = io();
  var activePolls;

  $('#newPoll').click(function(){
    console.log("button clicked!");
    var pollData = 
      {
        'id': socket.id,
        'title': 'pokemon', //$('#pollName').val(),
        'options': {
          'ans 1': 1,
          'ans 2': 2 
        }
      };
    socket.emit('new_poll', pollData);
  });
  
  socket.on('new_poll', function(newPoll) {
    makePoll(socket, newPoll);
  });

  socket.on('update_vote', function(vote){
    console.log('got update');
    var button = document.getElementById(vote['id'] + vote['option']);
    var currentSum = parseInt(button.innerHTML);
    button.innerHTML = currentSum + 1;
  });

  socket.on('current_polls', function(currentPolls){
    for(poll in currentPolls){
      makePoll(socket, currentPolls[poll]);
    }
  });

  $("#pollForm").submit( function() {
    console.log("title is: " + $("#title").val());
    console.log("option 1 is: " + $("#option1").val());
    console.log("option 2 is: " + $("#option2").val());
  });

});
