function makePoll(socket, poll) {
  var pollDiv = $('<div id="' + poll.id + '" class="activePollMenu"></div>');
  pollDiv.append(poll['title'] + "<br>");
  for (var key in poll['options']) {
    pollDiv.append(key + ": ");
    $('<button>')
      .attr('id', poll.id + key)
      .text(poll['options'][key])
      .appendTo(pollDiv)
      .click(function() {
          socket.emit('vote', { 'id': poll.id, 'option': key })});
    pollDiv.append("<br>");
  }
  $("#activePolls").append(pollDiv);
  console.log('button:' + $('#'+poll.id+"ans 1").text()==0);
}

$(document).ready(function() {
  var socket = io();
  var activePolls;

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
    makePoll(socket, newPoll);
  });

  socket.on('update_vote', function(vote){
      console.log('button:' + $('#'+vote['id']+vote['option']).val());
      var currentSum = parseInt($('#'+vote['id']+vote['option']).val());
      console.log('got vote update: ' + currentSum);
      $('#'+vote['id']+vote['option']).html(currentSum + 1);
  });

  socket.on('current_polls', function(currentPolls){
    for(poll in currentPolls){
      makePoll(socket, currentPolls[poll]);
    }
  });

});
