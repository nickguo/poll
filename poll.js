function makePoll(socket, poll) {
  var pollDiv = $('<div id="' + poll.id + '" class="activePollMenu"></div>');
  pollDiv.append(poll['title'] + "<br>");
  for (var key_original in poll['options']) {
    (function(key) {
      console.log('created: ' + poll.id + key);
      pollDiv.append(key + ": ");
      $('<button>')
        .attr('id', poll.id + key)
        .text(poll['options'][key])
        .appendTo(pollDiv)
        .click(function() {
          socket.emit('vote', { 'id': poll.id, 'option': key });
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
        'title': $('#title').val(),
        'options': {
          'ans 1': $('#option1').val(),
          'ans 2': $('#option2').val(),
          'ans 3': $('#option3').val() 
        }
      };
    socket.emit('new_poll', pollData);
  });
  
  socket.on('new_poll', function(newPoll) {
    console.log("poll received");
    makePoll(socket, newPoll);
  });

  socket.on('timeout_poll', function(timeoutPoll) {
    console.log("timeout poll received");
    $('#' + timeoutPoll.id).remove();
  });

  socket.on('update_vote', function(vote){
    console.log('got update');
    var button = document.getElementById(vote.id + vote.option);
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


var plusPulledDown = false;
$("#addPollButton").click(function(){
    if(plusPulledDown == false) {
        $("#addPollDiv").css("height", "200px");
        $("#addPollDiv").css("background-color", "white");
        $("#addPollDiv").css("border-bottom-color", "#ff8f00");
        $("#addPollDiv").css("border-top-color", "#ff8f00");
        $("#createNewPollForm").css("display", "inline-block");
        $("#addPollButton").css("top", "170px");
        $("#addPollButton").css("color", "#ff8f00");
        plusPulledDown = true;
    } else {
        $("#addPollDiv").css("height", "50px");
        $("#addPollDiv").css("background-color", "#ff8f00");
        $("#addPollDiv").css("border-bottom-color", "white");
        $("#addPollDiv").css("border-top-color", "white");
        $("#createNewPollForm").css("display", "none");
        $("#addPollButton").css("top", "15px");
        $("#addPollButton").css("color", "white");
        plusPulledDown = false;
    }
});

