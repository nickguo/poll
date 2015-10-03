function makePoll(socket, poll, created) {
  created = created || false;
  var pollDiv = $('<div id="' + poll.id + '" class="activePollMenu"></div>');
  pollDiv.append(poll['title'] + "<br>");
  for (var key_original in poll['options']) {
    (function(key) {
      console.log('created: ' + poll.id + key);
      pollDiv.append(key + ": ");
      $('<button>')
        .attr('id', poll.id + key)
        .attr('value', poll['options'][key])
        .text(created ? poll['options'][key] : 'x')
        .appendTo(pollDiv)
        .click(function() {
          socket.emit('vote', { 'id': poll.id, 'option': key, 'voter': socket.id });
          console.log('clicked: ' + poll.id + key);
        });
      pollDiv.append("<br>");
    }(key_original));
  }
  $(".activePolls").append(pollDiv);
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
          'ans 2': 2,
          'ans 3': 3 
        }
      };
    socket.emit('new_poll', pollData);
  });
  
  socket.on('new_poll', function(newPoll) {
    console.log("poll received");
    makePoll(socket, newPoll, newPoll.id == socket.id);
  });

  socket.on('timeout_poll', function(timeoutPoll) {
    console.log("timeout poll received");
    $('#' + timeoutPoll.id).remove();
  });

  // voted {} keeps track of which polls this socket has voted for
  voted = {}
  socket.on('update_vote', function(vote){
    console.log('got update');
    var button = document.getElementById(vote.id + vote.option);
    var currentSum = parseInt(button.value);
    button.value = currentSum + 1;
    // check if this poll has just been voted for by this socket
    if (!(vote.id in voted) && (vote.id == socket.id || vote.voter == socket.id)) {
      voted[vote.id] = true;
      $('button[id^="' + vote.id +'"]').filter(
          function(){
              this.innerHTML = this.value;
              return this.id.match(/\d+$/);
          });
    }
    // otherwise only update the button if the poll's been voted for
    else if (vote.id in voted) {
      button.innerHTML = button.value
    }
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
