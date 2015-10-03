$(document).ready(function() {
  var socket = io();
  var activePolls;
  var inactivePolls;

  $('#newPoll').click(function(){
    document.getElementById('newPollForm').style.display = "flex";
    var pollData = 
      {
        'id': socket.id,
        'title': 'pokemon', //$('#pollName').val(),
        'options': {
          'ans 1': 0,
          'ans 2': 0
        }
      };
    socket.emit('new_poll', pollData);
  });
  
  socket.on('new_poll', function(newPoll) {
    console.log('got new poll');
    $("#activePolls").append('<div class=activePollMenu">'
        + newPoll['title'] + '</div>');
  });

  socket.on('update_vote', function(vote){
      var currentSum = parseInt($('#target').html());
      $('#target').html(currentSum + 1);
  });

  socket.on('current_polls', function(currentPolls){
    activePolls = currentPolls['activePolls'];
    inactivePolls = currentPolls['inactivePolls'];
    for(poll in activePolls){
      var pollString = '<div class="activePollMenu">'
      pollString += activePolls[poll]['title']
      for (var key in activePolls[poll]['options']) {
        console.log('option: ' + key);
        pollString += key + ": " + activePolls[poll]['options'][key];
      }
      pollString += '</div>';
      $("#activePolls").append(pollString);
    }
  });

});
