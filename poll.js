$(document).ready(function() {
  var socket = io();
  var activePolls;
  var inactivePolls;

  var activeTab = $('#selectActive');
  
  $('#selectActive').click(function(){
    activeTab.css("background-color", "white");
    activeTab.css("color", "black");
    $('#selectActive').css("background-color", "black");
    $('#selectActive').css("color", "white");
    activeTab = $("#selectActive");
  });

  $('#selectInactive').click(function(){
    activeTab.css("background-color", "white");
    activeTab.css("color", "black");
    $('#selectInactive').css("background-color", "black");
    $('#selectInactive').css("color", "white");
    activeTab = $("#selectInactive");
  });
  $('#createNewPoll').click(function(){
    activeTab.css("background-color", "white");
    activeTab.css("color", "black");
    $('#createNewPoll').css("background-color", "black");
    $('#createNewPoll').css("color", "white");
    activeTab = $("#createNewPoll");
    $('#newPollMenu').css("display", "inline-block");
    $('#newPollMenu').css("height", "100px");
  });
  $('#newPoll').click(function(){
    document.getElementById('newPollForm').style.display = "flex";
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
  });
  
  socket.on('new_poll', function(newPoll) {
    $("#activePolls").append('<div class=activePollMenu">'
        + newPoll['title'] + '</div');
  });

  socket.on('update_vote', function(msg){
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
