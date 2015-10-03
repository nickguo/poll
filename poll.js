$(document).ready(function() {
  var socket = io();
  var activePolls;
  var inactivePolls;

  $('#newPoll').click(function(){
    var pollData = 
      {
        'id': socket.id,
        'title': $('#pollName').val(),
        'options': {
          'ans 1': 0,
          'ans 2': 0
        }
      };
    socket.emit('new_poll', pollData);
  }
  
  socket.on('new_poll', newPoll){
    $("#activePolls").append('<div class=activePollMenu">'
        + newPoll['title'] + '</div');
  }

  socket.on('update_vote', function(msg){
      console.log('got clicked');
      var currentSum = parseInt($('#target').html());
      $('#target').html(currentSum + 1);
  });

  socket.on('current_polls', function(currentPolls){
    activePolls = currentPolls['activePolls'];
    inactivePolls = currentPolls['inactivePolls'];
    for(poll in activePolls){
      $("#activePolls").append('<div class="activePollMenu">' 
            + activePolls[poll]['title'] 
            + '</div>');
    }
  });

});