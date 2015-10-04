// Uncomment to pursue using a timer countdown bar
/*function repeatXI(callback, interval, repeats, immediate) {
  var timer, trigger;
  trigger = function () {
    callback();
    --repeats || clearInterval(timer);
  };

  interval = interval <= 0 ? 1000 : interval; // default: 1000ms
  repeats  = parseInt(repeats, 10) || 0;      // default: repeat forever
  timer    = setInterval(trigger, interval);

  if( !!immediate ) { // Coerce boolean
    trigger();
  }
}*/

function makePoll(socket, poll, created) {
  var colorPairs = [["#F1EADC", "#1493A5"], ["#06B8CF", "#E7CF1A"], ["#00475E", "#FF0052"], ["light pink", "#3BB8C4"], ["#E0C4D8", "#086E8D"]];
  created = created || false;
  var pollDiv = $('<div id="' + poll.id + '" class="activePollMenu"> </div>');

  $("#pollWrapper").prepend(pollDiv);
  var cardWrapper = $('<div class="cardWrapper"></div>');
  var indicatorWrapperL = $('<div class="indicatorWrapper"></div>');
  var indicatorWrapperR = $('<div class="indicatorWrapper"></div>');

  var descWrapper = $('<div class="descriptionBox">' + poll.title + '</div>');// UNCOMMENT TO PURSUE TIMER COUNTDOWN BAR <hr class="timerBar" style="position:relative;margin:0;height:2px;color:#ff8f00;background-color:#ff8f00">');
  var voteWrapper = $('<div class="voteBox"></div>');
  var leftVote = $('<div class="leftVote"></div>');
  var rightVote = $('<div class="rightVote"></div>');
  var leftImg = $('<div class="leftImg" id="' + poll.id + '0Img" optValue="' + poll.options[0].name + '"><img src="' + poll.options[0].img + '" style="width:200px;height:200px"></div>');
  var rightImg = $('<div class="rightImg" id="' + poll.id + '1Img" optValue="' + poll.options[1].name + '"><img src="' + poll.options[1].img + '" style="width:200px;height:200px"></div>');
  var leftCount = $('<div class="leftCount" count="' + poll.options[0].votes + '" id="' + poll.id + 'Count0">' + (created ? poll.options[0].votes : '<i style="color: grey" class="fa fa-eye-slash"></i>') + '</div>');
  var rightCount = $('<div class="rightCount" count="' + poll.options[1].votes + '" id="' + poll.id + 'Count1">' + (created ? poll.options[0].votes : '<i style="color: grey" class="fa fa-eye-slash"></i>') + '</div>');
  var leftOpt = $('<div class="optionName">' + poll.options[0].name + '</div>');
  var rightOpt = $('<div class="optionName">' + poll.options[1].name + '</div>');
  var progBar = $('<div class="progBar"></div>');
  leftImg.click(function(){
    socket.emit('vote', { 'id': poll.id, 'option': poll.options[0].name, 'voter': socket.id , 'optIndex': 0});
  });
  rightImg.click(function(){
    socket.emit('vote', { 'id': poll.id, 'option': poll.options[1].name, 'voter': socket.id , 'optIndex': 1});
  });
  var colorPairing = colorPairs[Math.floor((Math.random() * colorPairs.length))];

  var leftPercentage = 0;
  var leftBar = $("<br><div class='progress' style='background-color:" + colorPairing[0] + "'><div class='leftBar bar-0 progress-bar progress-bar-info' id='" + "Bar" + poll.id + "' style='width: '" + leftPercentage + ";background-color:" + colorPairing[0] + "'></div></div>")

  if (!created) {
    leftBar.hide();
  }

  pollDiv.css("display", "none");
  pollDiv.fadeIn("slow", function(){});
  pollDiv.append(cardWrapper);

  cardWrapper.append(descWrapper);
  cardWrapper.append(voteWrapper);  
  cardWrapper.append(progBar);
  voteWrapper.append(leftImg);
  voteWrapper.append(rightImg);
  leftImg.prepend(leftOpt);
  leftImg.append(leftCount);
  progBar.append(leftBar);
  rightImg.prepend(rightOpt);
  rightImg.append(rightCount);

  // UNCOMMENT TO PURSUE TIMER COUNTDOWN BAR
  /*var barLength = parseFloat($(".timerBar").css("width"), 10);
  var lengthCountdown = function(){
    var currLength = parseFloat($(".timerBar").css("width"), 10);
    $(".timerBar").css("width", currLength - barLength / 75.0);
  };
  repeatXI(lengthCountdown, 1000, 75);*/
  //rightImg.append(rightBar);
  //$('#' + poll.id + 'Prog0')[0].css('background-color', colorPairing[0]);
  //$('#' + poll.id + 'Prog1')[0].css('background-color', colorPairing[1]);
}

$(document).ready(function() {
  var socket = io();
  var activePolls;
  $(".mdl-textfield__label").unbind("focus");
  $(".mdl-textfield__input").unbind("focus");

  // voted {} keeps track of which polls this socket has voted for
  voted = {}

  socket.on('new_poll', function(newPoll) {
    makePoll(socket, newPoll, newPoll.id == socket.id);
    if (newPoll.id == socket.id) {
      voted[socket.id] = true;
    }
  });

  socket.on('timeout_poll', function(timeoutPoll) {
    $('#' + timeoutPoll.id).fadeOut(1000, function() {
      $('#' + timeoutPoll.id).remove();
      if (timeoutPoll.id in voted) {
        delete voted[timeoutPoll.id]
      }
    });
  });

  socket.on('update_vote', function(vote){
    var countDiv = $('#' + vote.id + "Count" + String(vote.optIndex));
    var currentSum = parseInt(countDiv.attr('count'));
    console.log('got currentSum: ' + currentSum);

    countDiv.attr('count', currentSum + 1);
    // check if this poll has just been voted for by this socket
    if (!(vote.id in voted) && (vote.voter == socket.id)) {
      voted[vote.id] = true;
      $('div[id^="' + vote.id +'Count"]').filter(
          function(){
              console.log($('#' + this.id).attr('id').slice(-1));
              this.innerHTML = $('#' + this.id).attr('count');
              var percentage = 100.0 * vote["option0"] / (vote["option0"] + vote["option1"]);
              $('#Bar' + $('#' + this.id).attr('id').replace('Count0', '')).css("width", String(percentage) + "%");
              return this.id.match(/\d+$/);
          });
      $('.progress').show();
    }
    // otherwise only update the button if the poll's been voted for
    else if (vote.id in voted) {
      countDiv.text(countDiv.attr('count'));
      var percentage = 100.0 * vote["option0"] / (vote["option0"] + vote["option1"]);
      $('#Bar' + vote.id).css("width", String(percentage) + "%");
      console.log('updated countDiv');
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
          $(".addPollForm").css("height", "220px");
          $(".addPollForm").css("border-bottom-color", "#ff8f00");
          $(".addPollForm").css("border-top-color", "#ff8f00");
         // $("#addPollDiv").css("top", "200px");
          $("#createNewPollForm").fadeIn("slow", function(){});
          //$("#addPollButton").css("top", "170px");
          //$("#addPollButton").css("color", "#ff8f00");
          plusPulledDown = true;
      } else {
        titleVal = $('#title').val().trim();
        option1Val = $('#option1').val().trim();
        option2Val = $('#option2').val().trim();
        if (titleVal == '' || option1Val == '' || option2Val == '' || option1Val == option2Val) {
          if (titleVal == '') {
            $("#titleError").css("display", "block");
            $("#title").css("margin-bottom", "3px");
          }
          else {
            $("#titleError").css("display", "none");
            $("#title").css("margin-bottom", "20px");
          }

          if (option1Val == '') {
            $("#option1Error").css("display", "block");
            $("#option1").css("margin-bottom", "3px");
          }
          else {
            $("#option1Error").css("display", "none");
            $("#option1").css("margin-bottom", "20px");
          }
          if (option2Val == '') {
            console.log("this is happening");
            $("#option2Error").css("display", "block");
            $("#option2").css("margin-bottom", "3px");
          } 
          else {
            $("#option2Error").css("display", "none");
            $("#option2").css("margin-bottom", "20px");
          }

          if (option1Val == option2Val && option1Val != '') {
            $("#option2SameError").css("display", "block");
            $("#option2").css("margin-bottom", "3px");
          }
          else {
            $("#option2SameError").css("display", "none");
            $("#option2").css("margin-bottom", "20px");
          }
        }
        else {
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
          $("#titleError").css("display", "none");
          $("#titleDiv").css("padding-bottom", "20px");
          $("#option1Error").css("display", "none");
          $("#option1Div").css("padding-bottom", "20px");
          $("#option2Error").css("display", "none");
          $("#option2SameError").css("display", "none");
          $("#option2Div").css("padding-bottom", "20px");
        }
     }
  });

});

$('#addPollDiv').click(function() {
  $('#addPollButton').toggleClass('fa-caret-square-o-down').toggleClass('fa-plus-square');
});
