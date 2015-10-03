function makePollString(poll) {
  var pollString = '<div class="activePollMenu">'
  pollString += poll['title'] + "<br>"
  for (var key in poll['options']) {
    pollString += key + ": " + poll['options'][key];
  }
  pollString += '</div>';
  return pollString;
}

$(document).ready(function() {
  var socket = io();
  var activePolls;

  $('#newPoll').click(function(){
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
    $("#activePolls").append(makePollString(newPoll));
  });

  socket.on('update_vote', function(vote){
      var currentSum = parseInt($('#target').html());
      $('#target').html(currentSum + 1);
  });

  socket.on('current_polls', function(currentPolls){
    for(poll in currentPolls){
      $("#activePolls").append(makePollString(currentPolls[poll]));
    }
  });

  $("#pollForm").submit( function() {
    console.log("title is: " + $("#title").val());
    console.log("option 1 is: " + $("#option1").val());
    console.log("option 2 is: " + $("#option2").val());
  });

});
