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
  $("#pollWrapper").prepend(pollDiv);
  pollDiv.css("display", "none");
  pollDiv.css("height", "80px");
  pollDiv.fadeIn("slow", function(){});
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

var plusPulledDown = false;

$("#addPollDiv").click(function(){
    if(plusPulledDown == false) {
        //$(".addPollForm").css("display", "inline-block");
        $(".addPollForm").css("height", "180px");
        $(".addPollForm").css("border-bottom-color", "#ff8f00");
        $(".addPollForm").css("border-top-color", "#ff8f00");
       // $("#addPollDiv").css("top", "200px");
        $("#createNewPollForm").fadeIn("slow", function(){});
        //$("#addPollButton").css("top", "170px");
        //$("#addPollButton").css("color", "#ff8f00");
        plusPulledDown = true;
    } else {
        $(".addPollForm").css("height", "0px");
        $(".addPollForm").css("border-bottom-color", "white");
        $(".addPollForm").css("border-top-color", "white");
        $("#createNewPollForm").fadeOut("slow", function(){});
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
        plusPulledDown = false;
    }
});

});




