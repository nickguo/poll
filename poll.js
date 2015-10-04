function makePoll(socket, poll, created) {
  created = created || false;
  var pollDiv = $('<div id="' + poll.id + '" class="activePollMenu"> </div>');

  $("#pollWrapper").prepend(pollDiv);
  var cardWrapper = $('<div class="cardWrapper"></div>');
  var indicatorWrapperL = $('<div class="indicatorWrapper"></div>');
  var indicatorWrapperR = $('<div class="indicatorWrapper"></div>');

  var descWrapper = $('<div class="descriptionBox">' + poll.title + '</div>');
  var voteWrapper = $('<div class="voteBox;"></div>');
  var leftVote = $('<div class="leftVote">' + poll.options[0].name + '</div>');
  var rightVote = $('<div class="rightVote">' + poll.options[1].name + '</div>');
  var leftImg = $('<div class="leftImg" id="' + poll.id + poll.options[0].name + 'Img" optValue="' + poll.options[0].name + '"><img src="' + poll.options[0].img + '"></div>');
  var rightImg = $('<div class="rightImg" id="' + poll.id + poll.options[1].name + 'Img" optValue="' + poll.options[1].name + '"><img src="' + poll.options[1].img + '"></div>');
  var leftCount = $('<div class="leftCount" count="0" id="' + poll.id + 'Count' + poll.options[0].name + '">' + (created ? poll.options[0].votes : 'X') + '</div>');
  var rightCount = $('<div class="rightCount" count="0" id="' + poll.id + 'Count' + poll.options[1].name + '">' + (created ? poll.options[0].votes : 'X') + '</div>');
  var leftOptionText = $('<div class="optionText" id="' + poll.id + poll.options[0].name + 'Img">hi</div>');
  var rightOptionText = $('<div class="optionText" id="' + poll.id + poll.options[1].name + 'Img">hi</div>');

  leftImg.click(function(){
    socket.emit('vote', { 'id': poll.id, 'option': poll.options[0].name, 'voter': socket.id , 'optIndex': 0});
  });
  rightImg.click(function(){
    socket.emit('vote', { 'id': poll.id, 'option': poll.options[1].name, 'voter': socket.id , 'optIndex': 1});
  });

  pollDiv.css("display", "none");
  pollDiv.fadeIn("slow", function(){});
  pollDiv.append(indicatorWrapperL);
  pollDiv.append(cardWrapper);
  pollDiv.append(indicatorWrapperR);

  cardWrapper.append(descWrapper);
  cardWrapper.append(voteWrapper);  
  voteWrapper.append(leftVote);
  voteWrapper.append(rightVote);
  leftVote.append(leftImg);
  leftVote.append(leftCount);
  rightVote.append(rightImg);
  rightVote.append(rightCount);
  leftImg.prepend(leftOptionText);
  rightImg.prepend(rightOptionText);
}

$(document).ready(function() {
  var socket = io();
  var activePolls;

  socket.on('new_poll', function(newPoll) {
    makePoll(socket, newPoll, newPoll.id == socket.id);
  });

  // voted {} keeps track of which polls this socket has voted for
  voted = {}

  socket.on('timeout_poll', function(timeoutPoll) {
    $('#' + timeoutPoll.id).fadeOut(1000, function() {
      $('#' + timeoutPoll.id).remove();
      if (timeoutPoll.id in voted) {
        delete voted[timeoutPoll.id]
      }
    });
  });

  socket.on('update_vote', function(vote){
    var countDiv = $('#' + vote.id + "Count" + vote.option);
    var currentSum = parseInt(countDiv.attr('count'));
    console.log('got currentSum: ' + currentSum);

    countDiv.attr('count', currentSum + 1);
    // check if this poll has just been voted for by this socket
    if (!(vote.id in voted) && (vote.id == socket.id || vote.voter == socket.id)) {
      voted[vote.id] = true;
      $('div[id^="' + vote.id +'Count"]').filter(
          function(){
              this.innerHTML = $('#' + this.id).attr('count');
              return this.id.match(/\d+$/);
          });
    }
    // otherwise only update the button if the poll's been voted for
    else if (vote.id in voted) {
      countDiv.innerHTML = countDiv.value
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
              'options': 
                  [
                      {
                          'name': $('#option1').val(),
                          'votes': 0,
                          'img': ""
                      },
                      {
                          'name': $('#option2').val(),
                          'votes': 0,
                          'img': ""
                      }
                  ]
            };
          socket.emit('new_poll', pollData);
          plusPulledDown = false;
     }
  });

});

$('#addPollDiv').click(function() {
  $('#addPollButton').toggleClass('fa-caret-square-o-down').toggleClass('fa-plus-square');
});