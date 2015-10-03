$(document).ready(function() {
  var socket = io();

  $('#click-box').click(function(){
      console.log('clicked');
      socket.emit('vote', 'user voted');
  });

  socket.on('vote', function(msg){
      console.log('got clicked');
      var currentSum = parseInt($('#target').html());
      $('#target').html(currentSum + 1);
  });

  socket.on('current_polls', function(currentPolls){
    for(poll in currentPolls['activePolls']){
      $("#activePolls").append('<div class="activePollMenu">' 
            + currentPolls['activePolls'][poll]['title'] 
            + '</div>');
    }
  });

});
