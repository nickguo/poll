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

});
